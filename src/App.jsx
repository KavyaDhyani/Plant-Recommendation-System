import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './components/homepage/HomePage'
import MyPlants from './components/myplants_page/MyPlants'
import Search from './components/searchpage/Search'

function App() {
  return (
    <>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/myplants' element={<MyPlants />} />
        <Route path='/search' element={<Search />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App