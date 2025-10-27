/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

type ButtonProps = {
  text: string | React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export default function Button({
  text,
  type,
  className,
  onClick,
  disabled
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-md w-full ${className} cursor-pointer`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  )
}
