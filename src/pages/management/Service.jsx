import { Link } from 'react-router-dom';
import { useData } from '../../context/Data';
import style from '../../styles/management.module.css';
export default function Service() {
    const { tables } = useData();
    console.log(tables);

    return (
        <div className={style.container_service}>
            <div className={style.header_service}>
                <Link to='/products' className={style.button}>
                    Vai al gestionale
                </Link>
                <h1>SERVIZIO</h1>
            </div>
            <div className={style.grid}>
                {tables?.sort((a, b) => a.number - b.number).map(item => (
                    <Link to={item.open_order_id !== 0 ? `/management/order/${item.open_order_id}` : '#'} state={{ table: item }} key={item.id}
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
    );
}