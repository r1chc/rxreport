export default function Footer() {
  return (
    <footer style={{ background: '#2d5a4a' }}>
      <div
        className="max-w-5xl mx-auto px-6 pt-6 pb-20 md:pb-12 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ borderTop: '1px solid rgba(110,231,183,0.2)' }}
      >
        <p className="text-sm" style={{ color: '#a7f3d0' }}>
          © 2026 RxReport LLC. All Rights Reserved.
        </p>
        <nav className="flex gap-6 text-sm" aria-label="Legal">
          <a href="/privacy" className="transition-colors hover:text-white" style={{ color: '#6ee7b7' }}>
            Privacy Policy
          </a>
          <a href="/terms" className="transition-colors hover:text-white" style={{ color: '#6ee7b7' }}>
            Terms of Service
          </a>
          <a href="/disclaimer" className="transition-colors hover:text-white" style={{ color: '#6ee7b7' }}>
            Medical Disclaimer
          </a>
          <a href="/about" className="transition-colors hover:text-white" style={{ color: '#6ee7b7' }}>
            About
          </a>
        </nav>
      </div>
    </footer>
  )
}
