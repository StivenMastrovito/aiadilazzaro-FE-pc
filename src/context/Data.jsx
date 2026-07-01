import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import supabase from '../js/realtime'
import { stampaComanda, stampaBar } from '../js/printer'

const dataContext = createContext();

function DataContextProvider({ children }) {
    const [products, setProducts] = useState(null)
    const [tables, setTables] = useState([])
    const [categories, setCategories] = useState(null)
    const [orders, setOrders] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tablesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tables`);
                setTables(tablesResponse.data);
                const ordersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`);
                setOrders(ordersResponse.data);
                const productsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
                setProducts(productsResponse.data);
                const categoriesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`);
                setCategories(categoriesResponse.data);
            } catch (err) {
                console.error(err);
            };
        }
        fetchData();
    }, [])

    useEffect(() => {
        let debounceTimer = null;

        const channelOrders = supabase
            .channel('order_product-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'order_product' },
                async (payload) => {
                    console.log('PAYLOAD RICEVUTO:', payload)

                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        const response = await axios.post(
                            `${import.meta.env.VITE_BACKEND_URL}/api/orders/getUnprinted/${payload.new.order_id}`
                        );
                        console.log(response);
                        if (!response.data.products.length) return;
                        const productsKitchen = response.data.products.map(p => p.product.category_id !== 5);
                        const productsBar = response.data.products.map(p => p.product.category_id === 5);
                        if (productsKitchen.length > 0) {
                            const products = productsKitchen.map(item => ({
                                ...item.product,
                                pivot: {
                                    qty: item.qty,
                                    note: item.note,
                                    scope: item.scope,
                                }
                            }));

                            const order = {
                                number_order: response.data.order.number_order,
                                table: response.data.order.table.name,
                                productsKitchen,
                            }

                            stampaComanda(order);
                        }

                        if (productsBar.length > 0) {
                            const productsBar = productsBar.map(item => ({
                                ...item.product,
                                pivot: {
                                    qty: item.qty,
                                    note: item.note,
                                    scope: item.scope,
                                }
                            }));

                            const orderBar = {
                                number_order: response.data.order.number_order,
                                table: response.data.order.table.name,
                                productsBar,
                            }

                            stampaBar(orderBar);
                        }


                        const array_id = response.data.products.map(item => item.id);
                        await axios.post(
                            `${import.meta.env.VITE_BACKEND_URL}/api/orders/printed`,
                            { array_id }
                        );

                    }, 3000);
                }
            )
            .subscribe((status) => console.log('Orders:', status))

        const channelTables = supabase
            .channel('tables-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tables' },
                (payload) => {
                    console.log('PAYLOAD RICEVUTO:', payload)
                    if (payload.eventType === 'UPDATE') {
                        console.log('aggiorno');

                        setTables(prev => prev.map(table =>
                            table.id === payload.new.id ? payload.new : table
                        ))
                    }
                }
            )
            .subscribe((status) => console.log('Tables:', status))

        return () => {
            supabase.removeChannel(channelOrders)
            supabase.removeChannel(channelTables)
        }
    }, [])


    const dataValue = {
        products,
        orders,
        tables,
        categories,
        setProducts,
        setCategories,
        setTables,
        setOrders,
    }

    return (
        <dataContext.Provider value={dataValue}>
            {children}
        </dataContext.Provider>
    )
}

function useData() {
    return useContext(dataContext);
}

export { useData, DataContextProvider };