import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background mt-12">
      <div className="container mx-auto ">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="">
            <p>&copy; 2023 GeneMap. All rights reserved.</p>
          </div>
          <nav className="flex space-x-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

