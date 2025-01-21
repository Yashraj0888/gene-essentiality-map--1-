import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2023 GeneMap. All rights reserved.</p>
          </div>
          <nav className="flex space-x-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

