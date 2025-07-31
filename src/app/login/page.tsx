import { LoginForm } from '@/components'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-5">
          <div className="w-100 justify-content-center d-flex align-items-center">
            <Image
              src="/icons/icon-logo.png"
              width={32}
              height={32}
              alt="Logo"
              className="icon icon-xl"
            />
          <h1>Carel GPT</h1>
          </div>
          </div>
          
          <LoginForm />
          
          <div className="text-center mt-4">
            <p>Don&apos;t have an account?</p>
            <Link href="/signup" className="btn btn-link">
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}