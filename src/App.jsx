import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import ManagemantLayout from './layouts/ManagemantLayout'
import Products from './pages/management/Products'
import { DataContextProvider } from './context/Data'
import Categories from './pages/management/Categories'
import Tables from './pages/management/Tables'
import Orders from './pages/management/Orders'
import HomeDevice from './pages/device/Home'
import Order from './pages/device/Order'
import Service from './pages/management/Service'
import OrderManagement from './pages/management/Order';
import SingleOrder from './pages/management/SingleOrder'

function App() {

  return (
    <>
      <DataContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />

            <Route element={<ManagemantLayout />}>
              <Route path='/products' element={<Products />} />
              <Route path='/categories' element={<Categories />} />
              <Route path='/tables' element={<Tables />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/orders/:order_id' element={<SingleOrder />} />
            </Route>

            <Route path='/service' element={<Service />} />
            <Route path='/management/order/:order_id' element={<OrderManagement />} />


            <Route path='/device' element={<HomeDevice />} />
            <Route path='/device/order/:table_id' element={<Order />} />


          </Routes>
        </BrowserRouter>
      </DataContextProvider>
    </>
  )
}

export default App
