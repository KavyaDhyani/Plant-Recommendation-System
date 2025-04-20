import React, { useState } from 'react'

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

  //define the form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Save form data and notify parent
    localStorage.setItem('formData', JSON.stringify(formData))
    localStorage.setItem('hasCompletedForm', 'true')
    onSubmit(formData)
    
    setIsLoading(false)
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Get Recommendations'}
        </button>
      </form>
    </div>
  )
}

export default FirstTimeForm 
