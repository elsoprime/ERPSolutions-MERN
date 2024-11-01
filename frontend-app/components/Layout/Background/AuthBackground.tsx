/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */
'use client'
import {useEffect, useState} from 'react'
import {AuthBackgroundImages} from '@/data/Auth'
import 'aos/dist/aos.css'
import AOS from 'aos'

export default function AuthBackground() {
  const [currentBackground, setCurrentBackground] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    AOS.init() // Inicializa AOS
  }, [])

  // Cambia el fondo cada 5 segundos
  useEffect(() => {
    const backgroundInterval = setInterval(() => {
      setCurrentBackground(prev =>
        prev === AuthBackgroundImages.length - 1 ? 0 : prev + 1
      )
    }, 5000)
    return () => clearInterval(backgroundInterval)
  }, [])

  // Cambia la imagen y el texto cada 3 segundos
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageIndex(prevIndex =>
        prevIndex ===
        AuthBackgroundImages[currentBackground].backgroundImage.length - 1
          ? 0
          : prevIndex + 1
      )
    }, 3000)
    return () => clearInterval(imageInterval)
  }, [currentBackground])

  const {backgroundImage, textContent} = AuthBackgroundImages[currentBackground]
  const {title, description, dataAOS} = textContent[imageIndex] // Extrae dataAOS

  return (
    <div className='hidden lg:block lg:w-3/4 relative z-20'>
      {/* Renderizado de imágenes con transición suave */}
      {backgroundImage.map((img, idx) => (
        <div
          key={idx}
          className={`bg-cover bg-center h-full absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === imageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{backgroundImage: `url(${img.image})`}}
          role='img'
          aria-label={img.alt}
        />
      ))}

      {/* Contenido de texto con animación AOS */}
      <div className='absolute inset-0 flex items-center justify-center px-20 bg-gray-900 bg-opacity-80 text-white z-10'>
        <div
          className='p-2'
          data-aos={dataAOS || 'fade-up'} // Usa dataAOS de los datos o una animación por defecto
          data-aos-duration='1000'
          key={currentBackground + '-' + imageIndex} // Reinicia la animación en cada cambio de contenido
        >
          <h2 className='text-5xl font-bold'>{title}</h2>
          <p className='max-w-xl mt-3 font-light text-gray-300'>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
