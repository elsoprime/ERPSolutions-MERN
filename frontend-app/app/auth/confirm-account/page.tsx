import ConfirmView from '@/components/Modules/Auth/Views/ConfirmView'
import React from 'react'

type PageProps = {
  searchParams: {
    token?: string
  }
}

export default function ConfirmAccountPage({searchParams}: PageProps) {
  return <ConfirmView token={searchParams.token} />
}
