import axios from "axios";
import { useEffect, useState } from "react"
import { useData } from "../../context/Data";
import style from '../../styles/management.module.css'
import Error from "../../components/Error";
import Load from '../../components/Load'

export default function Tables() {
    const { tables, setTables } = useData();
    const [newTable, setNewTable] = useState('');
    const [updateTable, setUpdateTable] = useState(0);

    const [showStore, setShowStore] = useState(false);
    const [showDelete, setShowDelete] = useState(0);
    const [showUpdate, setShowUpdate] = useState(0);

    const [load, setLoad] = useState(false);
    const [error, setError] = useState(false);

    const addTable = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/tables`, { number: newTable });
            console.log(response);
            setTables(response.data.data);
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
            setNewTable('');
            setShowStore(false)
        }
    }

    const deleteTable = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/tables/${showDelete}`);
            setTables(response.data.data);
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
            setShowDelete(0);
        }
    }

    const functionUpdateTable = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tables/${showUpdate}`, { number: updateTable });
            setTables(response.data.data);
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
            setUpdateTable('');
            setShowUpdate(0);
        }
    }

    return (
        <>
            {load || !tables ? <Load /> :
                <div className={style.container}>
                    {error && <Error message={error} />}
                    <div className={style.header}>
                        <div>
                            <h2>Tavoli totali: {tables?.length || 0} </h2>
                        </div>
                        <button onClick={() => setShowStore(true)} className={style.button_add}>
                            <i className="bi bi-plus-lg"></i>
                            <h2>ADD</h2>
                        </button>
                    </div>
                    <div className={style.body}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <td>NUMERO</td>
                                    <td>OPZIONI</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tables && tables.length > 0 && tables.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.number}</td>
                                        <td className={style.td_options}>
                                            <button onClick={() => { setUpdateTable(item.number); setShowUpdate(item.id) }} className={style.button_modify}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button onClick={() => setShowDelete(item.id)} className={style.button_delete}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {showStore &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={addTable}>
                                <div className={style.group_form}>
                                    <label htmlFor="number">NUMERO TAVOLO:</label>
                                    <input type="number" min={1} name="number" value={newTable} onChange={(e) => setNewTable(e.target.value)} />
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>AGGIUNGI</button>
                                    <button onClick={() => { setNewTable(''); setShowStore(false) }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>

                    }
                    {showDelete > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={deleteTable}>
                                <h2>Sei sicuro di voler eliminare questo tavolo?</h2>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>ELIMINA</button>
                                    <button onClick={() => setShowDelete(0)} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                    {showUpdate > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={functionUpdateTable}>
                                <div className={style.group_form}>
                                    <label htmlFor="number">NUMERO TAVOLO:</label>
                                    <input type="number" min={1} name="number" value={updateTable} onChange={(e) => setUpdateTable(e.target.value)} />
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>MODIFICA</button>
                                    <button onClick={() => { setShowUpdate(0); setUpdateTable('') }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                </div>
            }
        </>
    )
}