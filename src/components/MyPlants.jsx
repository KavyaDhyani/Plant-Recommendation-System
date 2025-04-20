import React, { useState, useEffect, useRef } from 'react'
import { usePlantContext } from '../context/PlantContext'
import PlantCard from './PlantCard'
import { setupIntersectionObserver } from '../utils/plantUtils.jsx'
import LoadingDots from './LoadingDots'

function MyPlants() {
  //define the state variables
  const { savedPlants, removePlant } = usePlantContext()
  const [visibleCards, setVisibleCards] = useState(6)
  const loadMoreRef = useRef(null)

  // Reset visible cards when savedPlants length changes
  useEffect(() => {
    setVisibleCards(Math.min(6, savedPlants.length))
  }, [savedPlants.length])

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = setupIntersectionObserver(loadMoreRef, setVisibleCards, savedPlants.length)
    
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [savedPlants.length])

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6">My Plants 🌱</h1>
        
        {savedPlants.length === 0 ? (
          <div className="text-center bg-green-50 p-6 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't saved any plants yet.</p>
            <a 
              href="/search" 
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Search Plants
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {savedPlants.slice(0, visibleCards).map((plant) => (
                <PlantCard 
                  key={plant.scientificName} 
                  plant={plant} 
                  isInMyPlants={true} 
                  onRemove={() => removePlant(plant)}
                />
              ))}
            </div>
            {visibleCards < savedPlants.length && (
              <div ref={loadMoreRef} className="text-center py-4">
                <LoadingDots />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyPlants