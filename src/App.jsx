import React from 'react'
import NotFound from './assets/Pages/NotFound'
import { Route, Routes } from 'react-router-dom'
import Home from './assets/Pages/Home'
import NavBar from './assets/Components/NavBar'
import Footer from './assets/Components/Footer'
import Products from './assets/Pages/Products'
import About from './assets/Pages/About'
import Cart from './assets/Pages/Cart'
import Contact from './assets/Pages/Contact'


const App = () => {
  return (

    <div className='h-full w-full bg-background text-text-primary overflow-hidden'>
      <NavBar />
      <div className='px-8 py-20 min-h-screen'>
        <Routes>
          <Route path='*' element={<NotFound />} />
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/cart' element={<Cart />} />
        </Routes>
      </div>
      <Footer />

    </div>
  )
}

export default App

