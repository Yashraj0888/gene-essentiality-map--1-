"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function About() {
  return (
    <section className="py-20 md:py-32 text-center bg-white dark:bg-gray-900 transition-colors duration-500">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white"
      >
        Explore the World of Gene Essentiality
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto text-black dark:text-white text-justify"
      >
        Gene essentiality analysis provides valuable insights into understanding the genetic basis of diseases and their potential therapeutic targets. It helps identify genes that are crucial for the survival and fitness of cells within specific tissues, leading to better-targeted interventions in the field of precision medicine.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="mb-8"
      >
        <strong className="text-2xl text-black dark:text-white">Gene Effect (Gene Essentiality)</strong>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="text-lg md:text-xl max-w-2xl mx-auto text-black dark:text-white mb-8 text-justify"
      >
        The X-axis represents the <strong>gene effect</strong> (also known as gene essentiality), which measures how critical a specific gene is for the survival or fitness of a cell line in a particular tissue. 
        <ul className="list-inside list-disc text-black dark:text-white">
          <li>Negative values : Essential genes – knocking them out results in significantly reduced cell viability.</li>
          <li>Zero or near-zero values: Neutral genes – they don't affect cell survival much.</li>
          <li>Positive values : Beneficial genes – they help improve cell viability or fitness.</li>
        </ul>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-8"
      >
        <strong className="text-2xl text-black dark:text-white">Tissues</strong>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="text-lg md:text-xl max-w-2xl mx-auto text-black dark:text-white mb-8 text-justify"
      >
        The Y-axis represents various tissue types, each representing a different organ or cell line from which gene essentiality data is derived. Each tissue type can exhibit a unique response to gene knockouts, making it crucial to assess essentiality separately for different tissues.
        <ul className="list-inside list-disc text-black dark:text-white">
          <li>Lung, breast, liver, colon tissues – each with its own set of gene dependencies.</li>
          <li>Cell lines from these tissues provide valuable insights into the molecular differences between tissue types.</li>
        </ul>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mb-8"
      >
        <strong className="text-2xl text-black dark:text-white">Interpretation of the Graph</strong>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-lg md:text-xl max-w-2xl mx-auto text-black dark:text-white mb-8 text-justify"
      >
        In the gene essentiality graph, each data point represents a combination of gene effect and tissue type. The position on the X-axis shows how essential the gene is, while the Y-axis indicates the tissue type. 
        <ul className="list-inside list-disc text-black dark:text-white">
          <li>Points can be color-coded or sized based on additional variables such as gene expression levels or cell line names.</li>
          <li>This provides an intuitive way to understand the role of genes across different tissues.</li>
        </ul>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="mb-8"
      >
        <strong className="text-2xl text-black dark:text-white">Visualizing Gene Dependencies</strong>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="text-lg md:text-xl max-w-2xl mx-auto text-black dark:text-white mb-8 text-justify"
      >
        Visualizing gene dependencies across tissues not only allows for understanding gene function but also helps in identifying potential therapeutic targets. With the ability to study these dependencies in detail, scientists and researchers can develop more effective treatments.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <Link href="/gene-essentiality-map">
  <div className="relative inline-block">
    <Button
      size="lg"
      className="animate-bounce button text-white uppercase font-semibold text-sm px-6 py-3 rounded-3xl relative overflow-hidden "
    >
      Get Started
    </Button>
  </div>
</Link>
      </motion.div>
    </section>
  )
}
