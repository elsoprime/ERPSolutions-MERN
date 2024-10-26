/**
 * Autor: Esteban Soto @elsoprimeDev
 */
'use client'
import { useRouter } from "next/navigation"

type Props = {
    valueText: string
}

export default function GoBackButton({ valueText }: Props) {
    const router = useRouter()
    return (
        <button
            className='mt-6 inline-block w-full bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-300'
            onClick={() => router.back()}
        >
            {valueText}
        </button>
    )
}