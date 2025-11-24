'use client'
import { useEffect, useState } from 'react'
import { PinInput, PinInputField } from '@chakra-ui/pin-input'
import { useMutation, useQuery } from '@tanstack/react-query'
import bgImage from '@/public/images/BG004.webp'
import Logo from '@/components/Shared/Logo'
import { ConfirmToken } from '@/schemas/userSchema'
import { confirmAccount } from '@/api/AuthAPI'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { LoadingState } from '../States/LoadingState'
import { InvalidTokenState } from '../States/InvalidTokenState'
import { AlreadyConfirmedState } from '../States/AlreadyConfirmedState'
import { ConfirmationForm } from '../States/ConfirmationForm'
import { ErrorState } from '../States/ErrorState'

type ConfirmViewProps = {
  token?: string
}

// En ConfirmView.tsx

interface TokenValidationResponse {
  valid: boolean
  message: string
  alreadyConfirmed: boolean
  user?: {
    email: string
    name: string
  }
}

interface TokenError {
  error: {
    message: string
    code: string
  }
}

export default function ConfirmView({ token: initialToken }: ConfirmViewProps) {
  const {
    data: validationData,
    isLoading,
    error
  } = useQuery<TokenValidationResponse, TokenError>({
    queryKey: ['validateToken', initialToken],
    queryFn: async () => {
      if (!initialToken) return null
      const response = await fetch(`/api/auth/validate-token/${initialToken}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) {
        throw await response.json()
      }
      return response.json()
    },
    enabled: !!initialToken,
    retry: false
  })

  // Renderizado condicional usando los componentes State
  const renderState = () => {
    if (isLoading) {
      return <LoadingState />
    }

    if (error) {
      return <InvalidTokenState pathname='/auth/login' />
    }

    if (validationData?.alreadyConfirmed) {
      return <AlreadyConfirmedState user={validationData.user} />
    }

    if (validationData?.valid && initialToken) {
      return <ConfirmationForm token={initialToken} user={validationData.user} />
    }

    return (
      <ErrorState error='El Codigo de confirmación es inválido o ha expirado.' />
    )
  }

  return (
    <div
      className='relative min-h-screen flex items-center justify-center bg-contain'
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-gray-900/60 backdrop-blur-md'></div>

      <div className='relative z-10 px-4 xl:px-0 w-full max-w-md mx-auto'>
        <div className='-mt-36 relative justify-center mb-8'>
          <Logo width={300} height={250} />
        </div>

        <div className='bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
          <h2 className='text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-6 text-center'>
            Confirmar Código
          </h2>

          {renderState()}
        </div>
      </div>
    </div>
  )
}
