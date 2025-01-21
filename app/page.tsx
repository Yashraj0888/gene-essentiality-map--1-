'use client'

import { useState } from "react"
import { ThemeProvider } from "../components/ThemeProvider"
import { ThemeToggle } from "../components/ThemeToggle"
import { Button } from "@/components/ui/button"
import GeneEssentialityMap from "@/components/GeneEssentialityMap"
import { useRouter } from "next/navigation"

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
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Gene Essentiality Map</h1>
            <ThemeToggle />
          </div>

    
            <div className="container mx-auto px-4 py-8">
              
              <button onClick={() => showGene()}>get started</button>
          
              </div>
            </div>
        </div>
    </ThemeProvider>
  )
}
