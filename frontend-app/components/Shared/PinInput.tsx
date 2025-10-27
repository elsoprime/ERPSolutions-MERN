'use client'

import {useRef, useState, KeyboardEvent, ClipboardEvent} from 'react'

interface PinInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  isDisabled?: boolean
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  isDisabled = false
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (isDisabled) return

    // Solo permitir números
    if (digit && !/^\d$/.test(digit)) return

    const newValue = value.split('')
    newValue[index] = digit
    const updatedValue = newValue.join('').slice(0, length)

    onChange(updatedValue)

    // Mover al siguiente input si hay un dígito
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }

    // Llamar onComplete si se llenaron todos los campos
    if (updatedValue.length === length) {
      onComplete(updatedValue)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value.split('')

      if (value[index]) {
        // Si hay valor, borrarlo
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Si no hay valor, ir al anterior y borrarlo
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (isDisabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)

    // Solo permitir números
    if (!/^\d+$/.test(pastedData)) return

    onChange(pastedData)

    // Enfocar el último input llenado
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
    setFocusedIndex(nextIndex)

    // Llamar onComplete si se pegaron todos los dígitos
    if (pastedData.length === length) {
      onComplete(pastedData)
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
    // Seleccionar el contenido al enfocar
    inputRefs.current[index]?.select()
  }

  return (
    <div className='flex justify-center gap-3'>
      {Array.from({length}).map((_, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el
          }}
          type='text'
          inputMode='numeric'
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={isDisabled}
          className={`w-12 h-12 text-center text-xl font-bold rounded-lg border transition-all duration-300 
            ${
              isDisabled
                ? 'opacity-50 cursor-not-allowed bg-gray-100'
                : 'bg-white'
            }
            ${
              focusedIndex === index
                ? 'border-purple-500 ring-2 ring-purple-500'
                : 'border-purple-400'
            }
            focus:outline-none shadow
          `}
        />
      ))}
    </div>
  )
}
