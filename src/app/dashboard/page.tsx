import { Layout } from '@/components'
import Image from 'next/image'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container-fluid d-grid gap-5">

        <div>
       <h2 className="card-title">Welcome</h2>
          <p className="card-text text-muted">
            How can I help you today?
          </p>
        </div>
          
          <div>
          <h3>Email Tools</h3>
          <div className="row g-3">
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
                  <h5 className="card-title">Smart HTML <span className="badge text-bg-danger">Beta</span></h5>
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
                  <h5 className="card-title">HTML Translator <span className="badge text-bg-danger">Beta</span></h5>
                  <p className="card-text">Translate HTML files to English, Spanish, or French with live preview</p>
                  <a href="/html-translator" className="btn btn-danger">
                    Open HTML Translator
                  </a>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div>
            <h3>Photo Tools</h3>
              <div className="col-md-6">
              <div className="card border-info">
                <div className="card-body text-center">
                  <Image
                    src="/icons/icon-photos.png"
                    width={32}
                    height={32}
                    alt="Email"
                    className="icon icon-xl"
                  />
                  <h5 className="card-title">Image Resizing <span className="badge text-bg-success">New!</span></h5>
                  <p className="card-text">Resize images according to our Paygos guidelines</p>
                  <a href="/image-resize" className="btn btn-info">
                    Open Image Resizing
                  </a>
                </div>
              </div>
            </div>
          </div>

            <div>
            <h3>PDF Tools</h3>
              <div className="col-md-6">
              <div className="card border-info">
                <div className="card-body text-center">
                  <Image
                    src="/icons/icon-pdf.png"
                    width={32}
                    height={32}
                    alt="Email"
                    className="icon icon-xl"
                  />
                  <h5 className="card-title">PDF Generator <span className="badge text-bg-danger">Beta</span></h5>
                  <p className="card-text">Create branded PDF Documents with customizable templates</p>
                  <a href="/pdf-generator" className="btn btn-success">
                    Open PDF Generator
                  </a>
                </div>
              </div>
            </div>
          </div>
      </div>
      </Layout>
  )
}