"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 text-center ">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold mb-6"
      >
        Explore Gene Essentiality
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
      >
        Visualize and analyze gene dependencies across various tissues with our cutting-edge Gene Essentiality Map.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link href="/gene-essentiality-map">
          <Button size="lg" className="animate-pulse bg-black text-white hover:bg-gray-800 rounded-xl dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Get Started
          </Button>
        </Link>
      </motion.div> 
      {/* <AlertButton 
      text="Click for greeting" 
      alertMessage="Hello from my package!"
    /> */}
    </section>
  )
}

