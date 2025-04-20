import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import FirstTimeForm from './FirstTimeForm'
import PlantCard from './PlantCard'
import { usePlantContext } from '../context/PlantContext'
import { parseGeminiResponse, fetchPlantsWithImages, validatePlantData } from '../utils/plantUtils.jsx'
import LoadingDots from './LoadingDots'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function Home() {
  //define the state variables
  const { savedPlants, addPlant } = usePlantContext()
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasCompletedForm, setHasCompletedForm] = useState(false)
  
  const observerRef = useRef(null)
  const formDataRef = useRef(null)
  const hasInitialRecommendationsRef = useRef(false)
  const firstPlantRef = useRef(savedPlants[0]?.scientificName || null)
  
  //define the useEffect to check if the form has been completed
  useEffect(() => {
    const completed = localStorage.getItem('hasCompletedForm') === 'true'
    setHasCompletedForm(completed)
  }, [])

  //define the fetchRecommendations function
  const fetchRecommendations = useCallback(async (formData = null) => {
    setIsLoading(true)
    setError('')

    try {
      const firstPlant = savedPlants[0] || null;
      const savedPlantNames = savedPlants.map(p => p.scientificName.toLowerCase());
      
      //define the prompt
      const prompt = formData  
        ? `Based on these preferences:
          - Experience level: ${formData.experience}
          - Light conditions: ${formData.light}
          - Available space: ${formData.space}
          - Purpose: ${formData.purpose}
          
          Suggest 15 indoor plants that would be suitable. For each plant, provide:
          1. Common name
          2. Scientific name (in binomial nomenclature)
          3. Key benefits
          4. Light requirements
          5. Watering needs
          6. Humidity preferences
          7. Temperature range
          Return ONLY a JSON array of objects with these properties: name, scientificName, benefits, light, water, humidity, temperature. Do not include any markdown formatting or additional text.`
        : `Based on this plant in my collection:
          ${firstPlant ? `- ${firstPlant.name} (${firstPlant.scientificName}): ${firstPlant.benefits}` : ''}
          
          Suggest 15 different indoor plants that are similar to this plant but NOT the same plant. Consider:
          1. Similar care requirements (light, water, humidity)
          2. Similar benefits (air purification, aesthetics, etc.)
          3. Similar appearance (size, leaf shape, growth pattern)
          
          IMPORTANT: Do NOT suggest the same plant or varieties of the same plant. Each suggestion should be a completely different species.
          
          For each plant, provide:
          1. Common name
          2. Scientific name (in binomial nomenclature)
          3. Key benefits
          4. Light requirements
          5. Watering needs
          6. Humidity preferences
          7. Temperature range
          
          Return ONLY a JSON array of objects with these properties: name, scientificName, benefits, light, water, humidity, temperature. Do not include any markdown formatting or additional text.`

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
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
        
        // Filter out plants that are already in savedPlants
        const uniquePlants = plantsWithImages.filter(
          plant => !savedPlantNames.includes(plant.scientificName.toLowerCase())
        )
        //set the recommendations
        setRecommendations(uniquePlants.slice(0, 12))
        hasInitialRecommendationsRef.current = true
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err)
      setError('An error occurred while fetching recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [savedPlants])

  // Only run this effect when hasCompletedForm changes
  useEffect(() => {
    if (hasCompletedForm && !hasInitialRecommendationsRef.current) {
      if (formDataRef.current) {
        fetchRecommendations(formDataRef.current)
      } else {
        fetchRecommendations()
      }
    }
  }, [hasCompletedForm, fetchRecommendations])

  // Separate effect to handle plant changes
  useEffect(() => {
    if (hasCompletedForm && hasInitialRecommendationsRef.current) {
      const currentFirstPlant = savedPlants[0]?.scientificName || null
      if (currentFirstPlant !== firstPlantRef.current) {
        firstPlantRef.current = currentFirstPlant
        fetchRecommendations()
      }
    }
  }, [savedPlants.length, hasCompletedForm, fetchRecommendations])

  //Intersection Observer for smooth image loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            observerRef.current.unobserve(img)
          }
        })
      },
      { rootMargin: '50px 0px' }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  //define the handleFormSubmit function
  const handleFormSubmit = useCallback(async (formData) => {
    formDataRef.current = formData
    setHasCompletedForm(true)
    localStorage.setItem('hasCompletedForm', 'true')
  }, [])

  //define the render condition for the form
  if (!hasCompletedForm) {
    return <FirstTimeForm onSubmit={handleFormSubmit} />
  }

  //define the render condition for the home page
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Welcome to Your Green Companion 🌳
          </h1>
          <p className="text-gray-600">
            Discover new plants for your home or workplace 🏡
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-green-800 mb-4">
          {savedPlants.length > 0 ? 'Recommended Plants for You' : 'Recommended Plants Based on Your Preferences'}
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        {isLoading ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Finding your perfect plants...</p>
            <LoadingDots />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((plant) => (
              <PlantCard 
                key={plant.scientificName} 
                plant={plant}
                isInMyPlants={false}
                onAdd={() => addPlant(plant)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {savedPlants.length > 0 
                ? "We're working on finding more plants that complement your collection. Check back later!"
                : "Start by adding some plants to your collection!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home