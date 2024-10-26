/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */
import { useState } from 'react'
import { PhotoIcon } from '@heroicons/react/20/solid'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { object } from 'zod'

type ImageUploadProps = {
  label: string
  valueImageURL: string
  name: string
  alt?: string
  onUpload?: (url: string) => void
}

export default function ImageUpload({
  label,
  valueImageURL,
  name,
  alt,
  onUpload
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(valueImageURL)

  /*   const handleUpload = (result: any) => {
      setImageUrl(result.info.secure_url) // Reemplaza con tu propiedad de imagen de Cloudinary
      console.log(result)
    }
   */
  valueImageURL = imageUrl ? imageUrl : valueImageURL
  //console.log('Desde ImagenUpload:', valueImageURL)
  return (
    <CldUploadWidget
      onSuccess={(result, { widget }) => {
        if (result.event === 'success') {
          if (typeof result.info !== 'string') {
            if (result.info) {
              setImageUrl(result.info.secure_url)
            }
          }
          if (result.info && typeof result.info !== 'string' && result.info.secure_url) {
            onUpload && onUpload(result.info.secure_url)
          }
          widget.close()
        }
      }}
      uploadPreset='fo5tpf6j' // Reemplaza con tu upload preset de Cloudinary
      options={{ maxFiles: 1, cloudName: 'dwoxg3qte' }} // Reemplaza con tu cloud name de Cloudinary      
    >
      {({ open }) => (
        <>
          <div className='space-y-2 items-center'>

            <div
              className='relative cursor-pointer hover:opacity-70 transition p-10 border-neutral-300 shadow-md flex flex-col justify-center items-center gap-4 text-neutral-600 bg-slate-200'
              onClick={() => open()}
            >
              <PhotoIcon className='w-32 h-auto' />
              {imageUrl && (
                <div className='absolute inset-0 w-full h-auto'>
                  <Image
                    fill
                    style={{ objectFit: 'contain', }}
                    src={imageUrl}
                    alt={alt || ''}
                    className='px-4 py-2'
                  />
                </div>
              )}
            </div>
          </div>
          <input type='hidden' name={name} value={imageUrl || ''} />
        </>
      )}
    </CldUploadWidget>
  )
}
