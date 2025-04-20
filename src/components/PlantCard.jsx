import React, { useState, useCallback } from 'react'
import { defaultImage, formatPlantBenefits, getPlantCareTips } from '../utils/plantUtils.jsx'
import { FaCheck, FaTimes, FaSun, FaTint, FaCloud, FaThermometerHalf } from 'react-icons/fa'
import { usePlantContext } from '../context/PlantContext'

function PlantCard({ plant, isInMyPlants = false, onRemove }) {
  //define the state variables
  const [imageUrl, setImageUrl] = useState(plant.image || defaultImage)
  const [showCareTips, setShowCareTips] = useState(false)
  const { addPlant, removePlant, savedPlants } = usePlantContext()
  
  const isSaved = savedPlants.some(p => p.scientificName === plant.scientificName)
  const careTips = getPlantCareTips(plant)

  //define the handleCardClick function
  const handleCardClick = useCallback((e) => {
    if (isInMyPlants) {
      e.preventDefault()
      const searchQuery = encodeURIComponent(`${plant.name.toLowerCase()} buy online`)
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank')
    }
  }, [isInMyPlants, plant.name])

  //define the handleAddPlant function
  const handleAddPlant = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSaved) {
      addPlant(plant)
    }
  }, [isSaved, addPlant, plant])

  //define the handleRemovePlant function
  const handleRemovePlant = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInMyPlants) {
      onRemove()
    } else {
      removePlant(plant)
    }
  }, [isInMyPlants, onRemove, removePlant, plant])

  //define the handleImageError function
  const handleImageError = useCallback(() => {
    setImageUrl(defaultImage)
  }, [])

  //define the toggleCareTips function
  const toggleCareTips = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCareTips(prev => !prev)
  }, [])

  //define the render condition for the plant card
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isInMyPlants ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={plant.name} 
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
        {isInMyPlants ? (
          <div
            onClick={handleRemovePlant}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            title="Remove from My Plants"
          >
            <FaTimes className="h-5 w-5" />
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {isSaved ? (
              <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 py-2 rounded">
                <FaCheck className="text-green-600" />
                <span>Added to My Plants</span>
              </div>
            ) : (
              <button
                onClick={handleAddPlant}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Add to My Plants
              </button>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{plant.name}</h3>
        <p className="text-sm text-gray-600 italic">{plant.scientificName}</p>
        <p className="mt-2 text-gray-700">{formatPlantBenefits(plant.benefits)}</p>
        
        <button
          onClick={toggleCareTips}
          className="mt-3 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          {showCareTips ? 'Hide Care Tips' : 'Show Care Tips'}
        </button>

        {showCareTips && (
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaSun className="text-yellow-500" />
              <span>Light: {careTips.light}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTint className="text-blue-500" />
              <span>Water: {careTips.water}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCloud className="text-gray-500" />
              <span>Humidity: {careTips.humidity}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaThermometerHalf className="text-red-500" />
              <span>Temperature: {careTips.temperature}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(PlantCard)