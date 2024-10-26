/**
 * Autor: Esteban Soto @elsoprimeDev
 */
type SearchFormProps = {
  onSubmit?: () => void
  value?: string
  placeholder?: string
}

export default function SearchForm({
  onSubmit,
  value,
  placeholder
}: SearchFormProps) {
  return (
    <form
      onSubmit={() => onSubmit}
      noValidate
      className='flex items-center space-x-2'
    >
      <input
        type='text'
        placeholder={placeholder}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
      />
      <input
        type='submit'
        value={value}
        className='py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer hover:contrast-150 transition-all'
      />
    </form>
  )
}
