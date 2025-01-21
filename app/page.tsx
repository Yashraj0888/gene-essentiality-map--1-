'use client'

import { useState } from "react"
import { ThemeProvider } from "../components/ThemeProvider"
import { ThemeToggle } from "../components/ThemeToggle"
import { Button } from "@/components/ui/button"
import GeneEssentialityMap from "@/components/GeneEssentialityMap"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/HeroSection"
import { Footer } from "@/components/Footer"
import { AboutSection } from "@/components/AboutSection"
import { Header } from "@/components/Header"

export default function Home() {
  const router = useRouter()
  const [showGeneMap, setShowGeneMap] = useState(false)
  const showGene = () => {
    router.push("/gene-essentiality-map")
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
     
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            
            
            
            </div>
            
            <HeroSection />
            <AboutSection />
            <Footer />
            </div>
        </div>
      

    </ThemeProvider>
  )
}
