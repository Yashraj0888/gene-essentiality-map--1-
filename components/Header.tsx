"use client"

import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X, Github } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"


export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="py-4 px-4 md:px-6 bg-background">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className=" flex text-2xl font-bold  gap-2">
         <Image src="../gene.png" alt="GeneMap Logo" width={30} height={30} />
         GeneMap
        </Link>
        <div className="hidden md:flex space-x-4 items-center">
          <NavItems />
          <ThemeToggle />
          <GithubLink />
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden mt-4 py-4 bg-background"
        >
          <NavItems mobile />
          <div className="flex justify-center mt-4 space-x-4">
            <ThemeToggle />
            <GithubLink />
          </div>
        </motion.div>
      )}
    </header>
  )
}

function NavItems({ mobile = false }: { mobile?: boolean }) {
  const items = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/gene-essentiality-map", label: "Gene Map" },
  ]

  return (
    <nav className={`${mobile ? "flex flex-col space-y-2" : "space-x-4"}`}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-primary transition-colors">
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="hover:text-primary transition-colors"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}

function GithubLink() {
  return (
    <a
      href="https://github.com/yourusername/gene-essentiality-map"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary transition-colors"
    >
      <Github />
    </a>
  )
}

