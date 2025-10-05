import AuthForm from '@/component/AuthForm'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen auth-page-bg flex items-center justify-center p-6">
      {/* will be adding more feature in future */}
      <AuthForm/>
    </div>
  )
}

export default page
