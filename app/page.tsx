import GeneEssentialityMap from "../components/GeneEssentialityMap"
import { ThemeProvider } from "../components/ThemeProvider"
import { ThemeToggle } from "../components/ThemeToggle"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-black dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Gene Essentiality Map</h1>
            <ThemeToggle />
          </div>
          <p className="text-xl mb-12 text-gray-600 dark:text-gray-400">
            Explore gene essentiality across different tissues with our interactive visualization tool.
          </p>
          <GeneEssentialityMap />
        </div>
      </div>
    </ThemeProvider>
  )
}

