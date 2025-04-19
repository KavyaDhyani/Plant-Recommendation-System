import React from 'react'
import { Link } from 'react-router-dom'
function Navbar() {
  return (
    <div className="flex space-x-8 items-center pl-3 py-4">

      <Link to="/"  className="text-blue-500 text-3xl font-bold">
        Home
      </Link>

      <Link to="/myplants" className="text-blue-500 text-3xl font-bold">
        My Plants
      </Link>
      <Link to="/search" className="text-blue-500 text-3xl font-bold">
        Search
      </Link>
    </div>
  )
}

export default Navbar