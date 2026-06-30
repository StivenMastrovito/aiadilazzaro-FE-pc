import style from '../styles/home.module.css';
import logo from '../assets/logo.png'
import { Link, useNavigate } from 'react-router-dom';
export default function Home() {
    return (
        <>
            <div className={style.container}>
                <div className={style.logo}>
                    <img src={logo} alt="logo aia di lazzaro con gallina e agriturismo" />
                </div>
                <div className={style.button_section}>
                    <Link to={'/products'}>Gestionale</Link>
                    <Link to={'/device'}>Palmare</Link>
                </div>
            </div>
        </>
    )
}