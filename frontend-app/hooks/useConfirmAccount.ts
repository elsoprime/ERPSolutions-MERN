import {useState} from 'react'
import {useRouter} from 'next/navigation'

interface ConfirmAccountResponse {
  valid: boolean
  message: string
  alreadyConfirmed: boolean
  user?: {
    email: string
    name: string
  }
}

interface ErrorResponse {
  error: {
    message: string
    code: string
  }
}

export const useConfirmAccount = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateToken = async (
    token: string
  ): Promise<ConfirmAccountResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/validate-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error.message)
      }

      return data as ConfirmAccountResponse
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Error al validar el token'
      )
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const confirmAccount = async (token: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/confirm-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token})
      })

      if (!response.ok) {
        const data = (await response.json()) as ErrorResponse
        throw new Error(data.error.message)
      }

      // Si la confirmación es exitosa, redirigir al login
      router.push('/')
      return true
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Error al confirmar la cuenta'
      )
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    validateToken,
    confirmAccount,
    isLoading,
    error
  }
}
