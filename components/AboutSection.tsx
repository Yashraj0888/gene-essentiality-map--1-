"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function AboutSection() {
  const features = [
    {
      title: "Interactive Visualization",
      description: "Explore gene essentiality data through an intuitive and interactive scatter plot.",
    },
    {
      title: "Multi-tissue Analysis",
      description: "Compare gene dependencies across various tissues and cell lines.",
    },
    {
      title: "Data Filtering",
      description: "Easily filter and focus on specific tissues or gene effect ranges.",
    },
    {
      title: "Responsive Design",
      description: "Access and analyze data seamlessly on any device, from desktop to mobile.",
    },
  ]

  return (
    <section className="py-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

