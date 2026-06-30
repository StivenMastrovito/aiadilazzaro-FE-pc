import axios from "axios";
import { useEffect, useState } from "react"
import { useData } from "../../context/Data";
import style from '../../styles/management.module.css'
import Load from '../../components/Load'
import Error from "../../components/Error";

export default function Products() {
    const { products, setProducts, categories } = useData();
    const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: null, category_id: 1 });
    const [updateProduct, setUpdateProduct] = useState(null);

    const [showStore, setShowStore] = useState(false);
    const [showDelete, setShowDelete] = useState(0);
    const [showUpdate, setShowUpdate] = useState(0);

    const [load, setLoad] = useState(false);
    const [error, setError] = useState(false);

    const [filter, setFilter] = useState({ name: '', category: 0 })
    const [filteredProducts, setFilteredProducts] = useState(products || null);

    useEffect(() => {
        if (!products) return;
        resetFilter();
    }, [products])

    function updateFilter({ value, name }) {
        setFilter(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleFilter(e) {
        e.preventDefault()
        setFilteredProducts(
            products.filter((product) => product.name.toUpperCase().includes(filter.name.toUpperCase()) && (product.category_id === Number(filter.category) || Number(filter.category) === 0))
        );
    }

    function resetFilter() {
        setFilter({ name: '', category: 0 });
        setFilteredProducts(products);
    }

    const addProduct = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products`, newProduct);
            console.log(response);
            setProducts(response.data.data);
        } catch (err) {

            if (err.response.status === 422) {
                setError("Errore nell'inserimento dei dati!");
            } else {
                setError("C'è stato un errore riprova!")
            }

            setTimeout(() => {
                setError(null);
            }, 3000)

        } finally {
            setLoad(false);
            setNewProduct({ name: '', price: 0, description: '', category_id: 0 });
            setShowStore(false)
        }
    }

    const deleteProduct = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${showDelete}`);
            setProducts(response.data.data);
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

    const functionUpdateProduct = async (e) => {
        e.preventDefault();
        setLoad(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${showUpdate}`, updateProduct);
            setProducts(response.data.data);
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
            setUpdateProduct(null);
            setShowUpdate(0);
        }
    }

    function updateForm(fun, e) {
        const { name, value } = e.target;
        fun((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    return (
        <>
            {load || !filteredProducts ? <Load /> :
                <div className={style.container}>
                    {error && <Error message={error} />}
                    <div className={style.header}>
                        <div>
                            <h2>Prodotti totali: {filteredProducts?.length || 0} </h2>
                        </div>
                        <form onSubmit={(event) => handleFilter(event)} className={style.filter_group}>
                            <input placeholder="Ricerca..." type="text" name="name" value={filter.name} onChange={(e) => updateFilter(e.target)} />
                            <select value={filter.category} name="category" id="" onChange={(e) => updateFilter(e.target)}>
                                <option value='0'>Tutte le categorie...</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <button type="submit">
                                <i className="bi bi-search"></i>
                            </button>
                            <button onClick={resetFilter}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </form>
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
                                    <td>DESCRIZIONE</td>
                                    <td>CATEGORIA</td>
                                    <td>PREZZO</td>
                                    <td>OPZIONI</td>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts && filteredProducts.length > 0 && filteredProducts.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name.toUpperCase()}</td>
                                        <td>{item.description}</td>
                                        <td>{item.category.name.toUpperCase()}</td>
                                        <td>{item.price}€</td>
                                        <td className={style.td_options}>
                                            <button onClick={() => { setUpdateProduct(item); setShowUpdate(item.id) }} className={style.button_modify}>
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
                            <form className={style.form} onSubmit={addProduct}>
                                <div className={style.group_form}>
                                    <label htmlFor="name">NOME:</label>
                                    <input type="text" name="name" value={newProduct.name} onChange={(e) => updateForm(setNewProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="description">DESCRIZIONE:</label>
                                    <input type="text" name="description" value={newProduct.description} onChange={(e) => updateForm(setNewProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="price">PREZZO:</label>
                                    <input type="number" min={1} step={0.50} name="price" value={newProduct.price} onChange={(e) => updateForm(setNewProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="category_id">CATEGORIA:</label>
                                    <select name="category_id" id="category_id" value={newProduct.category_id} onChange={(e) => updateForm(setNewProduct, e)}>
                                        {categories && categories.map(item => (
                                            <option key={item.id} value={item.id}>{item.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>AGGIUNGI</button>
                                    <button onClick={() => { setNewProduct({ name: '', price: 0, description: '', category_id: 0 }); setShowStore(false) }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                    {showDelete > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={deleteProduct}>
                                <h2>Sei sicuro di voler eliminare questo prodotto?</h2>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>ELIMINA</button>
                                    <button onClick={() => setShowDelete(0)} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                    {showUpdate > 0 &&
                        <div className={style.wrapper}>
                            <form className={style.form} onSubmit={functionUpdateProduct}>
                                <div className={style.group_form}>
                                    <label htmlFor="name">NOME:</label>
                                    <input type="text" name="name" value={updateProduct.name} onChange={(e) => updateForm(setUpdateProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="description">DESCRIZIONE:</label>
                                    <input type="text" name="description" value={updateProduct.description} onChange={(e) => updateForm(setUpdateProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="price">PREZZO:</label>
                                    <input type="number" min={1} step={0.50} name="price" value={updateProduct.price} onChange={(e) => updateForm(setUpdateProduct, e)} />
                                </div>
                                <div className={style.group_form}>
                                    <label htmlFor="category_id">CATEGORIA:</label>
                                    <select name="category_id" id="category_id" value={updateProduct.category_id} onChange={(e) => updateForm(setUpdateProduct, e)}>
                                        {categories && categories.map(item => (
                                            <option key={item.id} selected={updateProduct.category.id === item.id} value={item.id}>{item.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={style.button_section}>
                                    <button type="submit" className={style.button_submit}>MODIFICA</button>
                                    <button onClick={() => { setUpdateProduct(null); setShowUpdate(false) }} className={style.button_annull}>ANNULLA</button>
                                </div>
                            </form>
                        </div>
                    }
                </div>
            }
        </>
    )
}