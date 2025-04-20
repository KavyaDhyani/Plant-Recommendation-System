import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PlantProvider } from './context/PlantContext'
import Home from './components/Home'
import Search from './components/Search'
import MyPlants from './components/MyPlants'
import Navbar from './components/Navbar'

function App() {
  return (
    <PlantProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/myplants" element={<MyPlants />} />
          </Routes>
        </div>
      </Router>
    </PlantProvider>
  )
}

export default App