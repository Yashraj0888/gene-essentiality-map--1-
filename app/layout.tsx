import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "../components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GeneMap",
  description: "Visualize gene essentiality across different tissues",
  icons: {
    icon: "../gene.png", // This references the favicon in the public folder
  },

}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        
        <Header />
          {children}
          
        </ThemeProvider>
      </body>
    </html>
  )
}

