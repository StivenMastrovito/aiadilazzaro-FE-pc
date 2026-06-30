import { Link, useLocation, useParams } from "react-router-dom";
import style from '../../styles/device.module.css'
import { useEffect, useState } from "react";
import Load from '../../components/Load'
import Error from '../../components/Error'
import axios from "axios";
import { useData } from '../../context/Data'

export default function Order() {
    const location = useLocation();
    const table = location.state.table;
    const { table_id } = useParams();
    const { products, categories, setTables } = useData();
    const [order, setOrder] = useState(null);
    const [filteredProductsId, setFilteredProductsId] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState(null);
    const [cart, setCart] = useState([]);
    const [cartNote, setCartNote] = useState([]);
    const [note, setNote] = useState('');
    const [openNote, setOpenNote] = useState(0);

    const [newOrder, setNewOrder] = useState({
        name: '',
        peoples: 0,
        table_id: table_id
    })

    const [openTable, setOpenTable] = useState(!table.name ? true : false)
    const [load, setLoad] = useState(true);
    const [error, setError] = useState(null);
    const [showOrder, setShowOrder] = useState(false);

    const [scope, setScope] = useState(1);
    function updateScope(nextScope) {
        if (nextScope === 6) {
            setScope(1);
        } else {
            setScope(nextScope)
        }
    }

    useEffect(() => {
        if (!products) return;
        if (!categories) return;
        const array = products.filter(product => product.category_id === filteredProductsId);
        setFilteredProducts(array);
    }, [filteredProductsId, products, categories])


    const createOrder = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, newOrder);
            setOrder(response.data.data);
            setTables(response.data.tables);
            setOpenTable(false);
        } catch (err) {
            if (err.response.status === 422) {
                return setError("Errore nell'inserimento dei dati!");
            }
            setError("C'è stato un errore riprova!")
            setTimeout(() => {
                setError(null);
            }, 3000)
        } finally {
            setLoad(false);
        }
    }

    useEffect(() => {
        setLoad(true);
        if (!table_id) return
        if (openTable) return setLoad(false);
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${table.open_order_id}`);
                console.log(response);
                setOrder(response.data);
            } catch (err) {
                setError("C'è stato un errore riprova!");
                setTimeout(() => {
                    setError(null);
                }, 3000)
            } finally {
                setLoad(false)
            }
        }
        fetchOrder();
    }, [table_id])

    function addProduct(product, isNote, note) {
        if (isNote) {
            return setCartNote(prev => [...prev, { ...product, qty: 1, note, scope }]);
        }

        const existingItem = cart.find(
            item => item.id === product.id && item.scope === scope
        );

        if (existingItem === undefined) {
            setCart(prev => [...prev, { ...product, qty: 1, scope }]);
        } else {
            setCart(prev =>
                prev.map(item =>
                    item.id === product.id && item.scope === scope
                        ? { ...item, qty: item.qty + 1 }
                        : item
                )
            );
        }
    }

    function deleteProduct(product, isNote, newQty) {
        if (isNote) {
            const newCartNote = cartNote.filter(
                item => !(item.id === product.id && item.scope === product.scope && item.note === product.note)
            );
            setCartNote(newCartNote);
        } else {
            if (newQty > 0) {
                const newCart = cart.map(item => {
                    if (item.id === product.id && item.scope === product.scope) {
                        return { ...item, qty: newQty };
                    }
                    return item;
                });
                setCart(newCart);
            } else {
                const newCart = cart.filter(
                    item => !(item.id === product.id && item.scope === product.scope)
                );
                setCart(newCart);
            }
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
        console.log(finalOrderProducts);

        try {
            setLoad(true);
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${order.id}`, {
                products: finalOrderProducts,
            });
            setOrder(response.data.data);
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


    if (load) {
        return <Load />
    }
    return (
        <>
            {openTable &&
                <div className={style.container_new_order}>
                    {error && <Error message={error} />}
                    <form className={style.form} onSubmit={createOrder}>
                        <div className={style.group_input}>
                            <label htmlFor="peoples">COPERTI</label>
                            <input type="number" min={1} id="peoples" name="peoples" value={newOrder.peoples} onChange={(e) => setNewOrder(prev => ({ ...prev, peoples: e.target.value }))} />
                        </div>
                        <div className={style.group_input}>
                            <label htmlFor="name">NOME TAVOLO</label>
                            <input type="text" required id="name" name="name" value={newOrder.name} onChange={(e) => setNewOrder(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className={style.button_section}>
                            <button type="submit" className={style.button_submit}>CREA</button>
                            <Link to={'/device'} className={style.button_annull}>ANNULLA</Link>
                        </div>
                    </form>
                </div>
            }
            {
                openNote > 0 &&
                <div className={style.container_note}>
                    <div className={style.form}>
                        <textarea className={style.textarea_note} name="note" id="note" cols="30" rows="10" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                        <div className={style.button_section}>
                            <button className={style.button_annull} onClick={() => {
                                setOpenNote(0);
                                setNote('');
                            }}>CHIUDI</button>
                            <button className={style.button_submit} onClick={() => {
                                addProduct(filteredProducts[openNote - 1], true, note);
                                setOpenNote(0);
                                setNote('');
                            }}>AGGIUNGI</button>
                        </div>
                    </div>

                </div>
            }
            <div className={style.container_order}>
                {load || !categories || !filteredProducts ? <Load /> :
                    <>
                        {error && <Error message={error} />}
                        <div className={style.header}>
                            <Link to={'/device'} className={style.go_back}>INDIETRO</Link>
                            <div className={style.info_header}>
                                <div className="">COPERTI: {order?.peoples}</div>
                                <div className="">CONTO: {order?.total_price} €</div>
                            </div>
                            <div onClick={() => sendOrder()} className={style.button_send_order}>INVIA</div>
                        </div>
                        <div className={style.body}>
                            <div className={style.left_scroll_categories}>
                                <div className={style.grid_categories}>
                                    {categories.map(category => (
                                        <div key={category.id} onClick={() => setFilteredProductsId(category.id)} className={style.card_category}>
                                            <h2>{category.name.toUpperCase()}</h2>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={style.right_scroll_products}>
                                <div className={style.grid_products}>
                                    {filteredProducts.map((product, index) => (
                                        <div key={product.id} onClick={() => addProduct(product, false, '')} className={style.card_product}>
                                            <h2>{product.name.toUpperCase()}</h2>
                                            <div className={style.footer_card_product}>
                                                <h3>{product.price}</h3>
                                                <div onClick={(e) => { e.stopPropagation(); setOpenNote(index + 1); }} className={style.button_note}>
                                                    <i className="bi bi-card-text"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div onClick={() => setShowOrder(true)} className={style.order_resume}>
                            <i className="bi bi-cart"></i>
                        </div>
                        <div onClick={() => updateScope(scope + 1)} className={style.order_scope}>
                            <h2>{scope} PORTATA</h2>
                        </div>
                        {showOrder &&
                            <div className={style.container_order_resume}>
                                <div className={style.order_resume_content}>
                                    <div className={style.order_resume_header}>
                                        <h2>Riepilogo ordine</h2>
                                        <div onClick={() => setShowOrder(false)} className={style.button_close_order_resume}>
                                            <i className="bi bi-x"></i>
                                        </div>
                                    </div>
                                    <div className={style.order_resume_grid}>
                                        {[...cart, ...cartNote].sort((a, b) => a.scope - b.scope).map((product, index) => (
                                            <div key={index} className={style.card_product}>
                                                <h2>{product.scope}. {product.name.toUpperCase()}</h2>
                                                <div className={style.footer_card}>
                                                    <div className={style.footer_card_product}>
                                                        <h3>{product.price} x {product.qty}</h3>
                                                        {product.note && <p>Note: {product.note}</p>}
                                                    </div>
                                                    <div className={style.button_delete} onClick={() => deleteProduct(product, product.note, product.qty - 1)}>
                                                        <i className="bi bi-trash"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* {cartNote.map((product, index) => (
                                            <div key={index} className={style.card_product}>
                                                <h2>{product.scope}. {product.name.toUpperCase()}</h2>
                                                <div className={style.footer_card}>
                                                    <div className={style.footer_card_product}>
                                                        <h3>{product.price} x {product.qty}</h3>
                                                        <p>Note: {product.note}</p>
                                                    </div>
                                                    <div className={style.button_delete} onClick={() => deleteProduct(product, true)}>
                                                        <i className="bi bi-trash"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))} */}
                                    </div>
                                </div>

                            </div>
                        }
                    </>
                }
            </div >
        </>
    )


}