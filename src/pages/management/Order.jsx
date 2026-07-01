import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/Data";
import { useEffect, useEffectEvent, useState } from "react";
import Load from "../../components/Load";
import style from "../../styles/management.module.css";
import Error from "../../components/Error";
import axios from "axios";
import supabase from "../../js/realtime";
import { stampaPreconto } from "../../js/printer";

export default function Order() {
    const { order_id } = useParams();
    const navigate = useNavigate();
    const { tables, orders, categories, products, setTables } = useData();
    const [order, setOrder] = useState(null);
    const [filteredProductsId, setFilteredProductsId] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState(null);
    const [copyOrderProducts, setCopyOrderProducts] = useState(null);
    const [cartDelete, setCartDelete] = useState([]);
    const [cartDeleteWithNote, setCartDeleteWithNote] = useState([]);


    const [cart, setCart] = useState([]);
    const [cartNote, setCartNote] = useState([]);
    const [note, setNote] = useState('');
    const [openNote, setOpenNote] = useState(0);
    const [showSummary, setShowSummary] = useState(false);

    const [load, setLoad] = useState(true);
    const [error, setError] = useState(null);

    const [newPeoples, setNewPeoples] = useState(0);
    const [showFormPeoples, setShowFormPeoples] = useState(false);

    const [newName, setNewName] = useState('');
    const [showFormName, setShowFormName] = useState(false);



    useEffect(() => {
        setLoad(true);
        if (!order_id || !orders || !categories || !products || !tables) return
        const foundOrder = orders.find((o) => o.id === Number(order_id));
        setCopyOrderProducts(foundOrder?.products);
        setOrder(foundOrder || []);
        setNewPeoples(foundOrder?.peoples)
        setNewName(foundOrder?.name)
        setLoad(false);
    }, [order_id, orders, categories, products, tables]);

    useEffect(() => {
        const channelOrders = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'order_product' },
                async (payload) => {
                    const ordersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${order_id}`);
                    setOrder(ordersResponse.data);
                }
            )
            .subscribe((status) => console.log('Orders:', status))

        return () => {
            supabase.removeChannel(channelOrders)
        }
    }, [])

    useEffect(() => {
        if (!filteredProductsId || !products) return setFilteredProducts(null);
        const filtered = products.filter((p) => p.category_id === filteredProductsId);
        setFilteredProducts(filtered);
    }, [filteredProductsId, products]);

    function addProduct(product, isNote, note) {
        console.log(cart, cartNote);
        if (isNote) {
            return setCartNote(prev => [...prev, { ...product, qty: 1, note, scope: 1 }])
        } else {
            if (cart.find(item => item.id === product.id) === undefined) {
                return setCart(prev => [...prev, { ...product, qty: 1, scope: 1 }])
            } else {
                const newCart = cart.map(item => {
                    if (item.id === product.id) {
                        return { ...item, qty: item.qty + 1 }
                    }
                    return item;
                });
                setCart(newCart);
            }
        }
    }

    function deleteProduct(product, isNote, newQty) {
        if (isNote) {
            const newCartNote = cartNote.filter((item, index) => index !== product);
            setCartNote(newCartNote);
        } else {
            if (newQty > 0) {
                const newCart = cart.map(item => {
                    if (item.id === product.id) {
                        return { ...item, qty: newQty }
                    }
                    return item;
                });
                setCart(newCart);
            } else {
                const newCart = cart.filter(item => item.id !== product.id);
                setCart(newCart);
            }
        }
    }

    function deleteOrderProduct(product, isNote) {
        if (isNote) {
            const newCopyOrderProducts = copyOrderProducts.filter((p) => p.pivot.id !== product.pivot.id);
            setCopyOrderProducts(newCopyOrderProducts);
            setCartDeleteWithNote(prev => [...prev, product]);
        } else {
            let copyProduct = copyOrderProducts.find(p => p.pivot.id === product.pivot.id);
            if (copyProduct.pivot.qty > 1) {

                const newCopyOrderProducts = copyOrderProducts.map((p) => {
                    if (p.pivot.id === product.pivot.id) {
                        return { ...p, pivot: { ...p.pivot, qty: p.pivot.qty - 1 } }
                    }
                    return p;
                });
                setCopyOrderProducts(newCopyOrderProducts);
            } else {
                const newCopyOrderProducts = copyOrderProducts.filter((p) => p.pivot.id !== product.pivot.id);
                setCopyOrderProducts(newCopyOrderProducts);
            }
            const copyDeleteProduct = cartDelete.find(p => p.pivot.id === product.pivot.id);
            if (copyDeleteProduct) {
                const newCartDelete = cartDelete.map((p) => {
                    if (p.pivot.id === product.pivot.id) {
                        return { ...p, qty: p.qty + 1 };
                    }
                    return p;
                });
                setCartDelete(newCartDelete);
            } else {
                setCartDelete(prev => [...prev, { ...product, qty: 1 }]);
            }
        }
    }

    const deleteOrder = async () => {
        console.log(cartDelete, cartDeleteWithNote);
        setLoad(true);
        try {
            if (cartDelete.length > 0) {
                console.log('no nota');

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders/products/${order.id}`, { products: cartDelete });
                console.log(response);
                setOrder(response.data.data);
                setCopyOrderProducts(response.data.data.products);
                setShowSummary(false);
                setCartDelete([]);
            }
            if (cartDeleteWithNote.length > 0) {
                console.log(' nota');
                const responseNote = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders/note/${order.id}`, { products: cartDeleteWithNote });
                console.log(responseNote);
                setOrder(responseNote.data.data);
                setCopyOrderProducts(responseNote.data.data.products);
                setShowSummary(false);
                setCartDeleteWithNote([]);
            }
        } catch (err) {
            setError("C'è stato un errore riprova!");
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false);
            setShowSummary(false)
        }
    }

    const changePeoples = async () => {
        setLoad(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${order.id}`, {
                peoples: newPeoples,
            });
            setOrder(response.data.data)
            setNewPeoples(response.data.data.peoples);
        } catch (err) {
            setError("C'è stato un errore riprova!");
            setNewPeoples(order.peoples)
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false)
            setShowFormPeoples(false);
        }
    }

    const changeName = async () => {
        setLoad(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${order.id}`, {
                name: newName,
                table_id: order.table_id
            });
            setOrder(response.data.data)
            setTable(response.data.tables)
            setNewName(response.data.data.name);
        } catch (err) {
            setError("C'è stato un errore riprova!");
            setNewName(order.name)
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false)
            setShowFormPeoples(false);
        }
    }

    const sendOrder = async () => {
        const finalOrderProducts = [...cart, ...cartNote];

        if (finalOrderProducts.length === 0) {
            setError("Aggiungi almeno un prodotto!");
            setTimeout(() => {
                setError(null);
            }, 3000)
            return;
        }
        try {
            setLoad(true);
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${order.id}`, {
                products: finalOrderProducts,
            });
            setOrder(response.data.data);
            setCopyOrderProducts(response.data.data.products);
            setCart([]);
            setCartNote([]);
        } catch (err) {
            setError("C'è stato un errore riprova!");
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false);
        }
    }

    const closeOrder = async () => {
        try {
            setLoad(true);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders/close/${order.id}`);
            console.log(response);
            await setTables(response.data.data);
            navigate('/service');
        } catch (err) {
            setError("C'è stato un errore riprova!");
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false);
        }
    }


    return (
        <div className={style.container_order}>
            {error && <Error message={error} />}
            {load ? <Load /> :
                <>
                    <div className={style.order_header}>
                        <Link to='/service' className={style.button_go_back}>
                            INDIETRO
                        </Link>
                        <div onClick={() => setShowFormName(true)} style={{ 'cursor': "pointer" }}>
                            TAVOLO: {order?.table.number || 'N/A'} - {order && order.name}
                        </div>
                        <div onClick={() => setShowFormPeoples(true)} style={{ 'cursor': "pointer" }} >
                            COPERTI: {order && order.peoples}
                        </div>
                        <div >
                            CONTO: {order && order.total_price} €
                        </div>

                        <div onClick={() => sendOrder()} className={style.button_send_order}>
                            INVIA
                        </div>
                        <div onClick={() => setShowSummary(true)} className={style.button_modify_order}>
                            MODIFICA
                        </div>
                        <div onClick={() => stampaPreconto(order)} className={style.button_modify_order}>
                            PRECONTO
                        </div>
                        <div onClick={() => closeOrder()} className={style.button_close_order}>
                            CHIUDI CONTO
                        </div>

                    </div>
                    <div className={style.order_body}>
                        <div className={style.order_categories}>
                            {categories?.map((c) => (
                                <div key={c.id} onClick={() => setFilteredProductsId(c.id)} className={`${style.order_category} ${filteredProductsId === c.id ? style.order_category_active : ''}`}>
                                    {c.name.toUpperCase()}
                                </div>
                            ))}

                        </div>
                        <div className={style.order_products}>
                            {filteredProducts?.map((p, i) => (
                                <div onClick={() => addProduct(p, false, null)} key={p.id} className={style.order_product}>
                                    <h2>{p.name.toUpperCase()}</h2>
                                    <div className={style.footer_card_product}>
                                        {p.price}
                                        <div onClick={(e) => { e.stopPropagation(); setOpenNote(i + 1); }} className={style.button_note}>
                                            <i className="bi bi-card-text"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={style.order_summary}>
                            <div className={style.order_total}>
                                Totale: {order?.total_price} €
                            </div>
                            <div className={style.grid_summary}>
                                {order?.products.map((p, i) => (
                                    <div key={i} className={style.summary_product}>
                                        <div className={style.summary_product_info}>
                                            <div className={style.summary_product_quantity}>
                                                {p.pivot.qty}x
                                            </div>
                                            <div className={style.summary_product_name}>
                                                {p.name.toUpperCase()} - {p.pivot.note}
                                            </div>
                                        </div>
                                        <div className={style.summary_product_price}>
                                            {p.price} €
                                        </div>

                                    </div>
                                ))}
                                <div className={style.line}></div>
                                {cart.map((p, i) => (
                                    <div key={i} className={style.summary_product}>
                                        <div className={style.summary_product_info}>
                                            <div className={style.summary_product_quantity}>
                                                {p.qty}x
                                            </div>
                                            <div className={style.summary_product_name}>
                                                {p.name.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className={style.new_order_section}>
                                            <div className={style.summary_product_price}>
                                                {p.price} €
                                            </div>
                                            <div className={style.button_delete} onClick={() => deleteProduct(p, false, p.qty - 1)}>
                                                <i className="bi bi-trash"></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cartNote.map((p, i) => (
                                    <div key={i} className={style.summary_product} >
                                        <div className={style.summary_product_info}>
                                            <div className={style.summary_product_quantity}>
                                                {p.qty}x
                                            </div>
                                            <div className={style.summary_product_name}>
                                                {p.name.toUpperCase()} - {p.note}
                                            </div>
                                        </div>
                                        <div className={style.new_order_section}>
                                            <div className={style.summary_product_price}>
                                                {p.price} €
                                            </div>
                                            <div className={style.button_delete} onClick={() => deleteProduct(i, true)}>
                                                <i className="bi bi-trash"></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </>
            }
            {
                openNote > 0 &&
                <div className={style.container_note}>
                    <div className={style.form_order}>
                        <textarea name="note" id="note" cols="30" rows="10" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                        <div className={style.button_section}>
                            <button className={style.button_annull} onClick={() => {
                                setOpenNote(0);
                                setNote('');
                            }}>CHIUDI</button>
                            <button type="submit" className={style.button_submit} onClick={() => {
                                addProduct(filteredProducts[openNote - 1], true, note);
                                setOpenNote(0);
                                setNote('');
                            }}>AGGIUNGI</button>
                        </div>
                    </div>
                </div>
            }

            {showFormPeoples &&
                <div className={style.container_note}>
                    <div className={style.form_order}>
                        <input className={style.input_peoples} type="number" name="peoples" id="peoples" value={newPeoples} onChange={(e) => setNewPeoples(e.target.value)}></input>
                        <div className={style.button_section}>
                            <button className={style.button_annull} onClick={() => {
                                setNewPeoples(order.peoples);
                                setShowFormPeoples(false);
                            }}>CHIUDI</button>
                            <button type="submit" className={style.button_submit} onClick={() => {
                                changePeoples();
                            }}>MODIFICA</button>
                        </div>
                    </div>
                </div>
            }

            {showFormName &&
                <div className={style.container_note}>
                    <div className={style.form_order}>
                        <input className={style.input_peoples} type="text" name="name" id="name" value={newName} onChange={(e) => setNewName(e.target.value)}></input>
                        <div className={style.button_section}>
                            <button className={style.button_annull} onClick={() => {
                                setNewName(order.name);
                                setShowFormName(false);
                            }}>CHIUDI</button>
                            <button type="submit" className={style.button_submit} onClick={() => {
                                changeName();
                            }}>MODIFICA</button>
                        </div>
                    </div>
                </div>
            }

            {showSummary &&
                <div className={style.container_order_resume}>
                    <div className={style.order_resume_content}>
                        <div className={style.order_resume_header}>
                            <h2>Riepilogo ordine</h2>
                            <div onClick={() => { setShowSummary(false); setCopyOrderProducts(order.products); setCartDelete([]); setCartDeleteWithNote([]) }} className={style.button_close_order_resume}>
                                <i className="bi bi-x"></i>
                            </div>
                        </div>
                        <div className={style.order_resume_grid}>
                            {copyOrderProducts?.map((p, i) => (
                                <div key={i} className={style.summary_product}>
                                    <div className={style.summary_product_info}>
                                        <div className={style.summary_product_quantity}>
                                            {p.pivot.qty}x
                                        </div>
                                        <div className={style.summary_product_name}>
                                            {p.name.toUpperCase()} - {p.pivot.note}
                                        </div>
                                    </div>
                                    <div className={style.new_order_section}>
                                        <div className={style.summary_product_price}>
                                            {p.price} €
                                        </div>
                                        <div className={style.button_delete} onClick={() => p.pivot.note === null ? deleteOrderProduct(p, false) : deleteOrderProduct(p, true,)}>
                                            <i className="bi bi-trash"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={style.button_section}>
                            <button className={style.button_send_delete} onClick={() => deleteOrder()}>ELIMINA PRODOTTI SELEZIONATI</button>
                        </div>
                    </div>
                </div>
            }
        </div >
    );
}