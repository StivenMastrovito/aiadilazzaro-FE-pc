import axios from "axios";
import { useEffect, useState } from "react"
import { useData } from "../../context/Data";
import style from '../../styles/management.module.css'
import Load from '../../components/Load'
import Error from "../../components/Error";

export default function Categories() {
    const { categories, setCategories } = useData();
    const [newCategory, setNewCategory] = useState('');
    const [updateCategory, setUpdateCategory] = useState('');

    const [showStore, setShowStore] = useState(false);
    const [showDelete, setShowDelete] = useState(0);
    const [showUpdate, setShowUpdate] = useState(0);

    const [load, setLoad] = useState(false);
    const [error, setError] = useState(false);

    const addCategory = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, { name: newCategory });
            console.log(response);
            setCategories(response.data.data);
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
            setNewCategory('');
            setShowStore(false)
        }
    }

    const deleteCategory = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${showDelete}`);
            setCategories(response.data.data);
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

    const functionUpdateCategory = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${showUpdate}`, { name: updateCategory });
            setCategories(response.data.data);
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
            setUpdateCategory('');
            setShowUpdate(0);
        }
    }

    return (
        <>
            {load || !categories ? <Load /> :
                <div className={style.container}>
                    {error && <Error message={error} />}
                    <div className={style.header}>
                        <div>
                            <h2>Categorie totali: {categories?.length || 0} </h2>
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
                                    <td>NOME</td>
                                    <td>OPZIONI</td>
                                </tr>
                            </thead>
                            <tbody>
                                {categories && categories.length > 0 && categories.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name.toUpperCase()}</td>
                                        <td className={style.td_options}>
                                            <button onClick={() => { setUpdateCategory(item.name); setShowUpdate(item.id) }} className={style.button_modify}>
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
                            <form className={style.form} onSubmit={addCategory}>
                                <div className={style.group_form}>
                                    <label htmlFor="name">NOME CATEGORIA:</label>
                                    <input type="text" name="name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>AGGIUNGI</button>
                                    <button onClick={() => { setNewCategory(''); setShowStore(false) }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>

                    }
                    {showDelete > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={deleteCategory}>
                                <h2>Sei sicuro di voler eliminare il prodotto?</h2>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>ELIMINA</button>
                                    <button onClick={() => setShowDelete(0)} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                    {showUpdate > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={functionUpdateCategory}>
                                <div className={style.group_form}>
                                    <label htmlFor="name">NOME CATEGORIA:</label>
                                    <input type="text" name="name" value={updateCategory} onChange={(e) => setUpdateCategory(e.target.value)} />
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>MODIFICA</button>
                                    <button onClick={() => { setShowUpdate(0); setUpdateCategory('') }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                </div>
            }
        </>
    )
}