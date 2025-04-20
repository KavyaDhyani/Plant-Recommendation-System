import React, { useState } from 'react'
import axios from 'axios'
import { parseGeminiResponse, validatePlantData } from '../utils/plantUtils.jsx'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

//define the form options

const FORM_OPTIONS = {
  experience: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ],
  light: [
    { value: 'low', label: 'Low Light' },
    { value: 'medium', label: 'Medium Light' },
    { value: 'bright', label: 'Bright Light' }
  ],
  space: [
    { value: 'small', label: 'Small Space' },
    { value: 'medium', label: 'Medium Space' },
    { value: 'large', label: 'Large Space' }
  ],
  purpose: [
    { value: 'decoration', label: 'Decoration' },
    { value: 'air-purification', label: 'Air Purification' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'hobby', label: 'Hobby' }
  ]
}

//define the form component

function FirstTimeForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    experience: 'beginner',
    light: 'medium',
    space: 'small',
    purpose: 'decoration'
  })

  //define the form state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  //define the form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    //gemini api call
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: `Based on these preferences:
              - Experience level: ${formData.experience}
              - Light conditions: ${formData.light}
              - Available space: ${formData.space}
              - Purpose: ${formData.purpose}
              
              Suggest 6 indoor plants that would be suitable. For each plant, provide:
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
        
        //save the form data and submit the form
        if (validPlants.length > 0) {
          localStorage.setItem('formData', JSON.stringify(formData))
          localStorage.setItem('hasCompletedForm', 'true')
          onSubmit(formData)
        } else {
          setError('No valid plant recommendations found. Please try again.')
        }
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError('An error occurred while generating recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  //define the form component
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">
        Let's Find Your Perfect Plants! 🌱
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(FORM_OPTIONS).map(([key, options]) => (
          <div key={key}>
            <label className="block text-gray-700 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
            </label>
            <select
              value={formData[key]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {error && (
          <p className="text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Finding Your Plants...' : 'Get Recommendations'}
        </button>
      </form>
    </div>
  )
}

export default FirstTimeForm 