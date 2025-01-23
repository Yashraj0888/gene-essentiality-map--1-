"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SpotlightCard from './StyleComponents/SpotlightCard';//reatsbits

export function AboutSection() {
  const features = [
    {
      title: "Interactive Visualization",
      description:
        "Dive into gene essentiality data with an engaging and interactive scatter plot. Effortlessly zoom, pan, and hover over data points for detailed insights, making your analysis more intuitive and efficient.",
    },
    {
      title: "Multi-tissue Analysis",
      description:
        "Analyze gene dependencies across a wide variety of tissues and cell lines. Compare data seamlessly to uncover patterns and trends across different biological systems, all in one unified interface.",
    },
    {
      title: "Data Filtering",
      description:
        "Easily filter large datasets to focus on specific tissues, gene effect ranges, or other key parameters. Save time and enhance precision by narrowing down the data to what truly matters.",
    },
    {
      title: "Responsive Design",
      description:
        "Our responsive design ensures a smooth experience on any device. Whether you're on a desktop, tablet, or smartphone, access and analyze data with ease and flexibility.",
    },
  ];

  return (
    <section className="py-20 flex flex-col items-center justify-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            
            <SpotlightCard className="custom-spotlight-card h-[200px]"spotlightColor="rgb(72, 61, 139), rgb(255, 105, 180)"


            >
                <i className="fa fa-lock"></i>
                <h2 className="text-2xl font-semibold mb-3 text-white ">{feature.title}</h2>
                <p className="text-white">{feature.description}</p>
            </SpotlightCard>
          </motion.div>
        ))}
        
      </div>
    </section>
  );
}
