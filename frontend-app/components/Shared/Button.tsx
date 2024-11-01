/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

type ButtonProps = {
  text: string
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: () => void
}

export default function Button({text, type, className, onClick}: ButtonProps) {
  return (
    <input
      type={type}
      className={`px-4 py-2 rounded-md w-full ${className} cursor-pointer`}
      value={text}
    />
  )
}
