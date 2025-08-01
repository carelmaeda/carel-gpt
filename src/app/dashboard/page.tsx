import { Layout } from '@/components'
import Image from 'next/image'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container-fluid">
          <h2 className="card-title">Welcome</h2>
          <p className="card-text text-muted">
            How can I help you today?
          </p>
          
          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <Image
                    src="/icons/icon-envelope.png"
                    width={32}
                    height={32}
                    alt="Email"
                    className="icon icon-xl"
                  />
                  <h5 className="card-title">Email Generator</h5>
                  <p className="card-text">Create branded HTML emails with customizable templates</p>
                  <a href="/email-generator" className="btn btn-primary">
                    Open Email Generator
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card border-secondary">
                <div className="card-body text-center">
                  <Image
                    src="/icons/icon-magic.png"
                    width={32}
                    height={32}
                    alt="Magic"
                    className="icon icon-xl"
                  />
                  <h5 className="card-title">Smart HTML</h5>
                  <p className="card-text">Upload HTML files and edit text content with live preview</p>
                  <a href="/smart-html" className="btn btn-secondary">
                    Open Smart HTML
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <Image
                    src="/icons/icon-translate.png"
                    width={32}
                    height={32}
                    alt="Translate"
                    className="icon icon-xl"
                  />
                  <h5 className="card-title">HTML Translator</h5>
                  <p className="card-text">Translate HTML files to English, Spanish, or French with live preview</p>
                  <a href="/html-translator" className="btn btn-danger">
                    Open HTML Translator
                  </a>
                </div>
              </div>
            </div>
          </div>
      </div>

      </Layout>
  )
}