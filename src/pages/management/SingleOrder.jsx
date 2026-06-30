import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom"
import style from '../../styles/management.module.css'
import Load from '../../components/Load'

export default function SingleOrder() {
    const location = useLocation();
    const [order, setOrder] = useState(location?.state.order);
    const { order_id } = useParams();
    console.log(order);

    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (order) return;
        const fetchOrder = async () => {
            setLoad(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/${order_id}`);
                console.log(response);
                setOrder(response.data);
            } catch (err) {
                setError("C'è stato un errore riprova!")
                setTimeout(() => {
                    setError(null);
                }, 3000)
            } finally {
                setLoad(false);
            }
        }
    }, [])


    return (
        <>
            {load || !order ? <Load /> :
                <div className={style.container}>
                    <div className={style.header_single_order}>
                        <Link to={'/orders'} className={style.button_go_back}>
                            INDIETRO
                        </Link>
                        <h2>
                            COPERTI: {order.peoples}
                        </h2>
                        <h2>
                            CONTO: {order.total_price}€
                        </h2>
                        <h2>
                            DATA: {order.created_at.substring(0, 10)}
                        </h2>
                        <h2>
                            NUMERO ORDINE: {order.number_order}
                        </h2>
                    </div>
                    <div className={style.body}>
                        <h1>PRODOTTI ORDINATI</h1>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <td>NOME</td>
                                    <td>QTY</td>
                                    <td>PREZZO</td>
                                    <td>NOTE</td>
                                </tr>
                            </thead>
                            <tbody>
                                {order.products.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name.toUpperCase()}</td>
                                        <td>{item.pivot.qty}</td>
                                        <td>{item.price}€</td>
                                        <td>{item.pivot.note || 'Nessuna nota'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            }
        </>
    )
}