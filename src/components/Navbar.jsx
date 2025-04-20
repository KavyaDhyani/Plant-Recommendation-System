import React from 'react'
import { Link } from 'react-router-dom'
import { FaLeaf } from 'react-icons/fa'

//define the navbar component

function Navbar() {
  return (
    <div className="bg-emerald-50 shadow-md pl-20">
      <div className="flex items-center h-20">
        <div className="flex items-center space-x-10">
          <Link to="/" className="flex items-center space-x-3 text-emerald-700 hover:text-emerald-900 transition-colors">
            <FaLeaf className="text-3xl" />
            <span className="text-2xl font-bold">Home</span>
          </Link>
          
          <Link to="/myplants" className="text-emerald-700 hover:text-emerald-900 transition-colors text-2xl font-semibold">
            My Plants
          </Link>
          
          <Link to="/search" className="text-emerald-700 hover:text-emerald-900 transition-colors text-2xl font-semibold">
            Search
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar