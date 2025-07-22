import SignupForm from '@/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-5">
            <h1>Email Generator</h1>
            <p className="lead">Create your account</p>
          </div>
          
          <SignupForm />
          
          <div className="text-center mt-4">
            <p>Already have an account?</p>
            <Link href="/login" className="btn btn-link">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}