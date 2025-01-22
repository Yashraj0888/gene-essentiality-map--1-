"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"



import SplitText from "./StyleComponents/SplitText"
import TrueFocus from "./StyleComponents/TrueFocus "

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 text-center">
      

      {/* Hero Content */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-6 text-white"
        >
          <TrueFocus
sentence="Gene Essentiality Map"
manualMode={false}
blurAmount={5}
borderColor="rgba(255, 105, 180,1)"
animationDuration={2}
pauseBetweenAnimations={1}
/>

        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-800 dark:text-gray-300"
        >
          Visualize and analyze gene dependencies across various tissues with our cutting-edge Gene Essentiality Map.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
    <Link href="/gene-essentiality-map">
  <div className="relative inline-block">
    <Button
      size="lg"
      className="animate-bounce mt-11 button  uppercase font-semibold text-sm px-6 py-3 rounded-3xl relative overflow-hidden text-gray-200 "
    >
      Get Started
    </Button>
  </div>
</Link>


        </motion.div>
      </div>
    </section>
  )
}
