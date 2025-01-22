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
    <header className="py-4 px-4 md:px-6 bg-gray-200 border-b border-gray-500 dark:bg-gray-800" >
      <div className="container mx-auto flex justify-between items-center ">
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
          <div className="flex justify-center items-center mt-4 space-x-4">
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
        <Link
          key={item.href}
          href={item.href}
          className="relative group hover:text-primary transition-all duration-300"
        >
          {item.label}
          {/* Animated Border (underline effect) */}
          <div className="absolute left-0 bottom-0 w-0 h-[2px] dark:bg-white bg-gray-800 transition-all duration-300 ease-in-out group-hover:w-full group-hover:left-0"></div>
        </Link>
      ))}
    </nav>
  );
  
  
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
      href="https://github.com/Yashraj0888/gene-essentiality-map--1-"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary transition-colors"
    >
      <Github />
    </a>
  )
}

