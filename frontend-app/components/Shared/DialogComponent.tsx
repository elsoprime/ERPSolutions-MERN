import {Dialog, Transition} from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentPlusIcon,
  InformationCircleIcon
} from '@heroicons/react/20/solid'
import {Fragment, useState, useRef} from 'react'

type DialogProps = {
  type?: 'upload' | 'download'
  isOpen: boolean
  onClose: () => void
  onConfirm: (data?: any[]) => void
  title: string
  description: string
  buttonActionText?: string
  buttonCancelText?: string
  enableCSVImport?: boolean
  csvHeaders?: string[]
}

type PreviewData = {
  id: string
  [key: string]: string
}

export default function DialogComponent({
  type,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  buttonActionText,
  buttonCancelText,
  enableCSVImport = false,
  csvHeaders = ['nombre', 'descripción']
}: DialogProps) {
  const [previewData, setPreviewData] = useState<PreviewData[]>([])
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          setError(
            'El archivo debe contener al menos una fila de datos además del encabezado'
          )
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

        // Validar que contenga los headers requeridos
        const missingHeaders = csvHeaders.filter(
          h => !headers.includes(h.toLowerCase())
        )
        if (missingHeaders.length > 0) {
          setError(
            `El archivo debe contener las columnas: ${csvHeaders.join(', ')}`
          )
          return
        }

        const data: PreviewData[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length >= csvHeaders.length) {
            const rowData: PreviewData = {
              id: `import-${Date.now()}-${i}`
            }
            headers.forEach((header, index) => {
              rowData[header] = values[index]
            })
            data.push(rowData)
          }
        }

        setPreviewData(data)
      } catch (err) {
        setError(
          'Error al procesar el archivo. Asegúrate de que sea un CSV válido.'
        )
      }
    }

    reader.readAsText(file)
  }

  const handleConfirm = () => {
    if (enableCSVImport && previewData.length > 0) {
      onConfirm(previewData)
      handleReset()
    } else {
      onConfirm()
    }
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setPreviewData([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-2xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col'>
                <div className='p-6 pb-4'>
                  <Dialog.Title
                    as='h3'
                    className={`flex flex-row gap-4 items-center text-2xl font-medium leading-6 ${
                      type === 'upload'
                        ? 'text-purple-600'
                        : type === 'download'
                        ? 'text-yellow-600'
                        : ''
                    }`}
                  >
                    {type === 'upload' ? (
                      <ArrowUpTrayIcon
                        className='h-6 w-6 text-purple-600'
                        aria-hidden='true'
                      />
                    ) : type === 'download' ? (
                      <ArrowDownTrayIcon className='h-6 w-6 text-yellow-600' />
                    ) : null}
                    {title}
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-sm text-gray-500'>{description}</p>
                  </div>
                </div>

                <div className='px-6 overflow-y-auto flex-1'>
                  {/* Input de archivo */}
                  <div className='mb-4'>
                    <div className='border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors bg-purple-50/30'>
                      <DocumentPlusIcon className='mx-auto mb-4 h-10 w-10 text-purple-600' />
                      <label htmlFor='file-upload' className='cursor-pointer'>
                        <div className='text-sm text-gray-600 mb-3'>
                          Haz clic para seleccionar un archivo CSV
                        </div>
                        <input
                          id='file-upload'
                          ref={fileInputRef}
                          type='file'
                          accept={enableCSVImport ? '.csv' : '*'}
                          onChange={
                            enableCSVImport ? handleFileChange : undefined
                          }
                          className='hidden'
                        />
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          className='inline-flex items-center px-4 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                        >
                          Seleccionar Archivo
                        </button>
                      </label>
                    </div>
                  </div>

                  {/* Mensajes de error */}
                  {error && (
                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                      <p className='text-sm text-red-600 flex items-center gap-2'>
                        <InformationCircleIcon className='h-5 w-5 text-red-600' />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Vista previa de datos */}
                  {enableCSVImport && previewData.length > 0 && (
                    <div className='mb-4 space-y-3'>
                      <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                        <p className='text-sm text-green-700 flex items-center gap-2'>
                          <CheckCircleIcon className='h-5 w-5 text-green-700' />
                          Vista previa: {previewData.length}{' '}
                          {previewData.length === 1
                            ? 'registro listo'
                            : 'registros listos'}{' '}
                          para importar
                        </p>
                      </div>

                      <div className='border border-gray-200 rounded-lg overflow-hidden'>
                        <div className='overflow-x-auto max-h-60'>
                          <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                              <tr>
                                {csvHeaders.map(header => (
                                  <th
                                    key={header}
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                              {previewData.slice(0, 5).map((row, index) => (
                                <tr key={index} className='hover:bg-gray-50'>
                                  {csvHeaders.map(header => (
                                    <td
                                      key={header}
                                      className='px-4 py-3 text-sm text-gray-700'
                                    >
                                      {row[header.toLowerCase()]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {previewData.length > 5 && (
                        <p className='text-sm text-gray-500 text-center'>
                          ... y {previewData.length - 5}{' '}
                          {previewData.length - 5 === 1
                            ? 'registro más'
                            : 'registros más'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ejemplo de formato CSV */}
                  {enableCSVImport && previewData.length === 0 && !error && (
                    <div className='mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                      <h4 className='font-semibold mb-2 text-sm text-gray-700'>
                        Formato del archivo CSV:
                      </h4>
                      <pre className='text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto'>
                        {csvHeaders
                          .map(h => h.charAt(0).toUpperCase() + h.slice(1))
                          .join(',')}
                        {'\n'}
                        {csvHeaders
                          .map(() => 'Electrónica, Respuestos, Hogar')
                          .join(',')}
                        {'\n'}
                        {csvHeaders
                          .map(() => 'Descripción, Accesorios, Utensilios')
                          .join(',')}
                      </pre>
                    </div>
                  )}
                </div>

                <div className='p-6 pt-4 flex gap-2'>
                  <button
                    type='button'
                    className={`flex-1 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      type === 'upload'
                        ? 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-500'
                        : type === 'download'
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus-visible:ring-yellow-500'
                        : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
                    } ${
                      enableCSVImport && previewData.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    onClick={handleConfirm}
                    disabled={enableCSVImport && previewData.length === 0}
                  >
                    {buttonActionText || 'Confirmar'}{' '}
                    {enableCSVImport &&
                      previewData.length > 0 &&
                      `(${previewData.length})`}
                  </button>
                  <button
                    type='button'
                    className='flex-1 inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                    onClick={handleCancel}
                  >
                    {buttonCancelText || 'Cancelar'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
