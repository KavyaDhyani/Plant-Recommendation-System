import React from 'react'

//loading dots animation for lazy loading

const LoadingDots = () => (
  <div className="animate-pulse flex justify-center">
    <div className="h-2 w-2 bg-green-600 rounded-full mx-1"></div>
    <div className="h-2 w-2 bg-green-600 rounded-full mx-1"></div>
    <div className="h-2 w-2 bg-green-600 rounded-full mx-1"></div>
  </div>
)

export default LoadingDots 