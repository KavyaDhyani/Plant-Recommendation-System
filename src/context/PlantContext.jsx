import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'

const PlantContext = createContext()

export function PlantProvider({ children }) {
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedPlants, setSavedPlants] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('savedPlants')
    return saved ? JSON.parse(saved) : []
  })

  // Save to localStorage whenever savedPlants changes
  useEffect(() => {
    localStorage.setItem('savedPlants', JSON.stringify(savedPlants))
  }, [savedPlants])

  const addPlant = useCallback((plant) => {
    setSavedPlants(prev => {
      // Check if plant is already saved
      if (!prev.some(p => p.scientificName === plant.scientificName)) {
        return [...prev, plant]
      }
      return prev
    })
  }, [])

  const removePlant = useCallback((plantOrName) => {
    setSavedPlants(prev => {
      const scientificName = typeof plantOrName === 'string' ? plantOrName : plantOrName.scientificName
      return prev.filter(plant => plant.scientificName !== scientificName)
    })
  }, [])

  const clearSearchResults = useCallback(() => {
    setSearchResults([])
    setError('')
  }, [])

  const value = useMemo(() => ({
    searchResults,
    setSearchResults,
    savedPlants,
    addPlant,
    removePlant,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearSearchResults
  }), [
    searchResults,
    savedPlants,
    addPlant,
    removePlant,
    isLoading,
    error,
    clearSearchResults
  ])

  return (
    <PlantContext.Provider value={value}>
      {children}
    </PlantContext.Provider>
  )
}

export function usePlantContext() {
  const context = useContext(PlantContext)
  if (!context) {
    throw new Error('usePlantContext must be used within a PlantProvider')
  }
  return context
} 