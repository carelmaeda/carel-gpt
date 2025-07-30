'use client'
import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="card-title text-danger">Authentication Error</h2>
              <p className="card-text">
                There was an error processing your magic link. This could happen if:
              </p>
              <ul className="text-start">
                <li>The link has expired</li>
                <li>The link has already been used</li>
                <li>The link is invalid</li>
              </ul>
              <Link href="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}