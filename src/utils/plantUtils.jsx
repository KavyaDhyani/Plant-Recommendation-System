import axios from 'axios'

//define the fallback image URL
export const FALLBACK_IMAGE_URL = 'https://i.pinimg.com/736x/e8/57/65/e85765051859e2dc2ad3bb24b094abf5.jpg'

// Default image URL for plants
export const defaultImage = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'

//fetching image from i
const fetchImageFromINaturalist = async (scientificName) => {
  try {
    const response = await axios.get(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}`
    )
    console.log('iNaturalist response:', response.data)
    
    if (response.data.results && response.data.results.length > 0) {
      const firstResult = response.data.results[0]
      if (firstResult.default_photo && firstResult.default_photo.medium_url) {
        return firstResult.default_photo.medium_url
      }
    }
    return null
  } catch (err) {
    console.error('iNaturalist API error:', err)
    return null
  }
}

//define the setupIntersectionObserver function for smooth image loading
export const setupIntersectionObserver = (loadMoreRef, setVisibleCards, totalItems, increment = 3) => {
  if (!loadMoreRef.current) return null

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCards(prev => Math.min(prev + increment, totalItems))
      }
    },
    { threshold: 0.5 }
  )

  observer.observe(loadMoreRef.current)
  return observer
}

export const fetchPlantsWithImages = async (plantsData) => {
  try {
    return await Promise.all(
      plantsData.map(async (plant) => {
        const imageUrl = await fetchImageFromINaturalist(plant.scientificName)
        return {
          ...plant,
          image: imageUrl || FALLBACK_IMAGE_URL,
          addedAt: new Date().toISOString()
        }
      })
    )
  } catch (error) {
    console.error('Error fetching plant images:', error)
    return plantsData.map(plant => ({
      ...plant,
      image: FALLBACK_IMAGE_URL,
      addedAt: new Date().toISOString()
    }))
  }
}

export const parseGeminiResponse = (responseText) => {
  try {
    return JSON.parse(
      responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
    )
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
    return []
  }
}

export const formatPlantBenefits = (benefits) => {
  if (Array.isArray(benefits)) {
    return benefits.join(', ')
  }
  return benefits || 'No specific benefits listed'
}

export const getPlantCareTips = (plant) => {
  return {
    light: plant.light || 'Moderate indirect light',
    water: plant.water || 'Water when top inch of soil is dry',
    humidity: plant.humidity || 'Average household humidity',
    temperature: plant.temperature || 'Room temperature (65-75°F)'
  }
}

export const validatePlantData = (plant) => {
  return plant && 
         typeof plant === 'object' &&
         plant.name &&
         plant.scientificName &&
         plant.benefits
} 