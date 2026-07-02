import axios from "axios";
import { useEffect, useState } from "react";
import Error from "../../components/Error";
import Load from "../../components/Load";
import { useData } from '../../context/Data'
import style from '../../styles/management.module.css'

export default function Stats() {
    const [stats, setStats] = useState(null);
    const { categories } = useData();

    const [load, setLoad] = useState(false);
    const [error, setError] = useState(false);

    const [filter, setFilter] = useState({ name: '', category: 0, before: '', after: '' })
    const [filteredStats, setFilteredStats] = useState(stats || null);


    const fetchStats = async (reset) => {
        setLoad(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/stats`, { before: filter.before, after: filter.after });
            setStats(response.data);
            if (reset) {
                setFilteredStats(response.data);
            } else {
                setFilteredStats(
                    response.data.filter((product) => product.product.name.toUpperCase().includes(filter.name.toUpperCase()) && (product.product.category_id === Number(filter.category) || Number(filter.category) === 0))
                );
            }
            setLoad(false);
        } catch (err) {
            setError('Errore nel caricamento dei dati');
        }
    }

    useEffect(() => {
        fetchStats();
    }, [])

    function updateFilter({ value, name }) {
        setFilter(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleFilter(e) {
        e.preventDefault()
        console.log(filter);
        if (filter.before || filter.after) {
            console.log('fetch');

            fetchStats();
        } else {
            setFilteredStats(
                stats.filter((product) => product.product.name.toUpperCase().includes(filter.name.toUpperCase()) && (product.product.category_id === Number(filter.category) || Number(filter.category) === 0))
            );
        }
    }

    const resetFilter = async () => {
        setFilter({ name: '', category: 0, before: '', after: '' });
        fetchStats(true);
    }

    return (
        <>
            <>
                {error ? <Error message={error} /> :
                    !filteredStats || load ? <Load /> :
                        <div className={style.container}>
                            <div className={style.header}>
                                <form onSubmit={(event) => handleFilter(event)} className={style.filter_group}>
                                    <input placeholder="Ricerca..." type="text" name="name" value={filter.name} onChange={(e) => updateFilter(e.target)} />
                                    <select value={filter.category} name="category" id="" onChange={(e) => updateFilter(e.target)}>
                                        <option value='0'>Tutte le categorie...</option>
                                        {categories?.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <div className={style.filter_group_date}>
                                        <label htmlFor="before">DAL:</label>
                                        <input type="date" name="before" id="before" onChange={(e) => updateFilter(e.target)} value={filter.before} />
                                    </div>
                                    <div className={style.filter_group_date}>
                                        <label htmlFor="after">AL:</label>
                                        <input type="date" name="after" id="after" onChange={(e) => updateFilter(e.target)} value={filter.after} />
                                    </div>
                                    <button type="submit">
                                        <i className="bi bi-search"></i>
                                    </button>
                                    <button type="button" onClick={() => resetFilter()}>
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </form>
                            </div>
                            <div className={style.body}>
                                <table className={style.table}>
                                    <thead>
                                        <tr>
                                            <td>NOME</td>
                                            <td>CATEGORIA</td>
                                            <td>VENDUTI</td>
                                            <td>PREZZO</td>
                                            <td>PREZZO TOTALE</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStats.map(item => (
                                            <tr key={item.product_id}>
                                                <td>{item.product.name.toUpperCase()}</td>
                                                <td>{item.product.category.name.toUpperCase()}</td>
                                                <td>{item.total}</td>
                                                <td>{item.product.price}€</td>
                                                <td>{Number(item.product.price) * item.total}€</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                }
            </>
        </>
    )
}