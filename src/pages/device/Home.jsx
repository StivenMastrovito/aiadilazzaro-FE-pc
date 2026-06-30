import { Link } from "react-router-dom";
import Load from "../../components/Load";
import { useData } from "../../context/Data"
import style from '../../styles/device.module.css'

export default function Home() {
    const { tables } = useData();
    console.log(tables);

    return (
        <>
            {!tables ? <Load /> :
                <div className={style.container}>
                    <div className={style.grid}>
                        {tables.map(item => (
                            <Link to={`/device/order/${item.id}`} state={{ table: item }} key={item.id}
                                className={
                                    item.open_order_id !== 0
                                        ? style.card_table_open
                                        : style.card_table_close
                                }>

                                <div className={style.tableNumber}>
                                    {item.number}
                                </div>

                                {item.name && (
                                    <div className={style.tableName}>
                                        {item.name}
                                    </div>
                                )}

                                <div className={style.tableStatus}>
                                    {item.open_order_id !== 0 ? '● OCCUPATO' : '● LIBERO'}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            }
        </>
    )
}