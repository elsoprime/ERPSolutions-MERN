/**
 * useTypography Hook
 * @description: Hook para gestionar las fuentes de manera elegante
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { useMemo } from 'react'

export type FontType = 'noto' | 'roboto-light' | 'roboto' | 'roboto-bold' | 'poppins'
export type FontPurpose = 'heading' | 'body' | 'caption' | 'button' | 'display'

interface TypographyOptions {
  font?: FontType
  purpose?: FontPurpose
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

export const useTypography = (options: TypographyOptions = {}) => {
  const { font, purpose, weight, size } = options

  const getClassName = useMemo(() => {
    let classes: string[] = []

    // Aplicar fuente específica o por propósito
    if (font) {
      switch (font) {
        case 'noto':
          classes.push('font-noto')
          break
        case 'roboto-light':
          classes.push('font-roboto-light')
          break
        case 'roboto':
          classes.push('font-roboto')
          break
        case 'roboto-bold':
          classes.push('font-roboto-bold')
          break
        case 'poppins':
          classes.push('font-poppins')
          break
      }
    } else if (purpose) {
      switch (purpose) {
        case 'heading':
          classes.push('font-heading')
          break
        case 'body':
          classes.push('font-body')
          break
        case 'caption':
          classes.push('font-caption')
          break
        case 'button':
          classes.push('font-button')
          break
        case 'display':
          classes.push('font-poppins')
          break
      }
    }

    // Aplicar peso de fuente
    if (weight) {
      switch (weight) {
        case 'light':
          classes.push('font-light')
          break
        case 'normal':
          classes.push('font-normal')
          break
        case 'medium':
          classes.push('font-medium')
          break
        case 'semibold':
          classes.push('font-semibold')
          break
        case 'bold':
          classes.push('font-bold')
          break
      }
    }

    // Aplicar tamaño
    if (size) {
      classes.push(`text-${size}`)
    }

    return classes.join(' ')
  }, [font, purpose, weight, size])

  return {
    className: getClassName,
    style: {} // Podrías agregar estilos CSS-in-JS aquí si necesitas
  }
}

// Hook simplificado para casos comunes
export const useFont = (fontType: FontType) => {
  return useTypography({ font: fontType })
}

// Presets comunes
export const typographyPresets = {
  pageTitle: () => useTypography({ purpose: 'heading', weight: 'bold', size: '3xl' }),
  sectionTitle: () => useTypography({ purpose: 'heading', weight: 'semibold', size: '2xl' }),
  cardTitle: () => useTypography({ font: 'roboto-bold', weight: 'medium', size: 'lg' }),
  bodyText: () => useTypography({ purpose: 'body', size: 'base' }),
  smallText: () => useTypography({ purpose: 'caption', size: 'sm' }),
  buttonText: () => useTypography({ purpose: 'button', weight: 'medium' }),
  displayText: () => useTypography({ purpose: 'display', weight: 'bold', size: '4xl' })
}