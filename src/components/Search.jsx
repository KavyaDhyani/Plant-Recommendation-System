import React, { useState } from 'react'
import axios from 'axios'
import PlantCard from './PlantCard'
import { usePlantContext } from '../context/PlantContext'
import { fetchPlantsWithImages, parseGeminiResponse, validatePlantData } from '../utils/plantUtils.jsx'
import LoadingDots from './LoadingDots'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function Search() {

  //define the state variables
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')
  const { 
    searchResults, 
    setSearchResults, 
    addPlant, 
    removePlant,
    savedPlants,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearSearchResults
  } = usePlantContext()

  const plantsPerPage = 3
  const totalPages = Math.ceil(searchResults.length / plantsPerPage)
  const startIndex = (currentPage - 1) * plantsPerPage
  const endIndex = startIndex + plantsPerPage
  const currentPlants = searchResults.slice(startIndex, endIndex)

  //define the handleSearch function
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    setCurrentPage(1)
    clearSearchResults()

    //define the prompt
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: `Based on this description: "${query}", suggest 12 indoor plants that would be suitable. For each plant, provide:
              1. Common name
              2. Scientific name (in binomial nomenclature)
              3. Key benefits
              4. Light requirements
              5. Watering needs
              6. Humidity preferences
              7. Temperature range
              Return ONLY a JSON array of objects with these properties: name, scientificName, benefits, light, water, humidity, temperature. Do not include any markdown formatting or additional text.`
            }]
          }]
        },
        {
          params: {
            key: API_KEY
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      //parse the response
      if (response.data.candidates && response.data.candidates[0].content.parts[0].text) {
        const plantsData = parseGeminiResponse(response.data.candidates[0].content.parts[0].text)
        const validPlants = plantsData.filter(validatePlantData)
        const plantsWithImages = await fetchPlantsWithImages(validPlants)
        setSearchResults(plantsWithImages)
      } else {
        setError('No results found. Try a different description.')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err.response?.data?.error?.message || 'An error occurred while searching. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  //define the render condition for the search page
  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-green-800 mb-4">
          Find Your Perfect Plant
        </h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your ideal plant..."
              className="flex-1 p-2 border border-gray-300 rounded-l"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-4 rounded-r hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-center text-red-600 mb-4">{error}</p>
        )}

        {isLoading ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Searching for plants...</p>
            <LoadingDots />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentPlants.map((plant) => (
                <PlantCard 
                  key={plant.scientificName} 
                  plant={plant} 
                  isInMyPlants={savedPlants.some(p => p.scientificName === plant.scientificName)}
                  onAdd={() => addPlant(plant)}
                  onRemove={() => removePlant(plant)}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-100 rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search