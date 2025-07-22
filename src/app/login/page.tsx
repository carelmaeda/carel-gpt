import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-5">
            <h1>Email Generator</h1>
          </div>
          
          <LoginForm />
          
          <div className="d-flex justify-content-between p-3">
            <p>Don&apos;t have an account?</p>
            <Link href="/signup" className="btn btn-link p-0 m-0">
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}