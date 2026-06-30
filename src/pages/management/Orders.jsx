import axios from "axios";
import { useEffect, useState } from "react"
import { useData } from "../../context/Data";
import style from '../../styles/management.module.css'
import Load from '../../components/Load'
import Error from "../../components/Error";
import { Link } from "react-router-dom";

export default function Orders() {
    const { orders, setOrders } = useData();
    return (
        <>
            {!orders ? <Load /> :
                <div className={style.container}>
                    <div className={style.header}>
                        <div>
                            <h2>Ordini totali: {orders?.length || 0} </h2>
                        </div>
                    </div>
                    <div className={style.body}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <td>NUMERO ORDINE</td>
                                    <td>NOME</td>
                                    <td>PERSONE</td>
                                    <td>PREZZO</td>
                                    <td>OPZIONI</td>
                                </tr>
                            </thead>
                            <tbody>
                                {orders && orders.length > 0 && orders.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.number_order}</td>
                                        <td>{item.name.toUpperCase()}</td>
                                        <td>{item.peoples}</td>
                                        <td>{item.total_price}€</td>
                                        <td className={style.td_options}>
                                            <Link to={`/orders/${item.id}`} state={{ order: item }} className={style.button_modify}>
                                                <i className="bi bi-eye-fill"></i>
                                            </Link>
                                        </td>
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