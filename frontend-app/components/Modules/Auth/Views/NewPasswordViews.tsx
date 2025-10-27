import {useState} from 'react'
import {ConfirmToken, ChangePasswordForm} from '@/schemas/userSchema'
import Logo from '@/components/Shared/Logo'
import bgImage from '@/public/images/BG004.webp'
import {useForm} from 'react-hook-form'
import NewPasswordForms from '../Forms/NewPasswordForm'
import NewPasswordToken from '../Forms/NewPasswordToken'
import {AlreadyConfirmedState} from '../States/AlreadyConfirmedState'
import {LoadingState} from '../States/LoadingState'
import {InvalidTokenState} from '../States/InvalidTokenState'

type NewPasswordViewProps = {
  dataAOS?: string
}

export default function NewPasswordView({dataAOS}: NewPasswordViewProps) {
  const [token, setToken] = useState<ConfirmToken['token']>('')
  const [tokenStatus, setTokenStatus] = useState<
    'pending' | 'loading' | 'valid' | 'invalid'
  >('pending')
  const [isPasswordChanged, setIsPasswordChanged] = useState(false)
  const initialData: ChangePasswordForm = {
    password: '',
    passwordConfirmation: ''
  }
  const {
    register,
    formState: {errors}
  } = useForm<ChangePasswordForm>({defaultValues: initialData})

  return (
    <>
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
        <div className='absolute inset-0 bg-gradient-to-tr from-slate-200/70 via-slate-400/70 to-slate-500/90 backdrop-blur-md'></div>

        <div
          className='relative z-10 px-4 xl:px-0 w-full max-w-lg mx-auto'
          data-aos={dataAOS || 'zoom-in'}
        >
          <div className='-mt-36 relative justify-center mb-8'>
            <Logo width={300} height={250} />
          </div>

          {tokenStatus === 'loading' ? (
            <div className='bg-gradient-to-tl from-white/80 to-gray-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
              <LoadingState />
            </div>
          ) : tokenStatus === 'invalid' ? (
            <div className='bg-gradient-to-tl from-white/80 to-gray-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
              <InvalidTokenState pathname='/auth/forgot-password' />
            </div>
          ) : tokenStatus === 'pending' ? (
            <NewPasswordToken
              token={token}
              setToken={setToken}
              setTokenStatus={setTokenStatus}
            />
          ) : isPasswordChanged ? (
            <div className='bg-gradient-to-tl from-white/80 to-gray-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
              <AlreadyConfirmedState
                Encabezado='Contraseña Actualizada'
                Subtitulo='Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.'
                navigationPath='/'
              />
            </div>
          ) : (
            <div className='bg-gradient-to-tl from-white/80 to-gray-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center'>
              <h2 className='text-3xl font-black bg-gradient-to-r from-orange-500 to-purple-600 text-transparent bg-clip-text mb-6 text-left'>
                Restablecer Contraseña
              </h2>
              <p className='text-gray-500 mb-6 text-left'>
                Ingresa tu nueva contraseña abajo. Asegúrate de que tenga al
                menos
                <span className='text-lg font-bold text-purple-600'>
                  {' '}
                  un mínimo de 6 caracteres
                </span>
              </p>
              <div className='relative z-10 w-full'>
                <NewPasswordForms
                  register={register}
                  errors={errors}
                  token={token}
                  onPasswordChanged={() => setIsPasswordChanged(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
