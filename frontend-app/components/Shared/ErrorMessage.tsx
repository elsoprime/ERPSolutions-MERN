/**
 * Autor: Esteban Soto @elsoprimeDev
 */
import {useState, useEffect} from 'react'

export default function ErrorMessage({children}: {children: React.ReactNode}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <div
      className={`text-xs mt-1 text-red-500 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
