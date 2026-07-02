import { Link, NavLink, Outlet } from 'react-router-dom';
import style from '../styles/managemantLayout.module.css';

export default function ManagemantLayout() {
    return (
        <div className={style.container}>
            <header className={style.header}>
                <div className={style.button_option}>
                    <Link to={'/service'}>VAI AL SERVIZIO</Link>
                </div>
                <nav className={style.nav}>
                    <NavLink to={'/products'}>
                        PRODOTTI
                    </NavLink>
                    <NavLink to={'/tables'}>
                        TAVOLI
                    </NavLink>
                    <NavLink to={'/categories'}>
                        CATEGORIE
                    </NavLink>
                    <NavLink to={'/orders'}>
                        ORDINI
                    </NavLink>
                    <NavLink to={'/stats'}>
                        STATISTICHE
                    </NavLink>
                </nav>
            </header>
            <div className={style.content}>
                <Outlet />
            </div>
        </div>
    )
}