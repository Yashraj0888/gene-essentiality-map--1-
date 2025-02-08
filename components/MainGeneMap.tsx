// pages/GeneEssentialityMap.tsx
"use client"

import { useState } from "react"
import { GeneSearchForm } from "./Form"
import { GeneEssentialityChart } from "./GeneEssentialityMap"
// import { GeneEssentialityChart } from "@aganitha/gene-essentiality-chart"



export default function MainGeneMap() {
  const [ensemblId, setEnsemblId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState("")

  return (
    <div className="space-y-4">
      <GeneSearchForm
        setEnsemblId={setEnsemblId}
        loading={loading}
        error={error}
      />
       <GeneEssentialityChart
        ensemblId={ensemblId}
        setLoading={setLoading}
        setError={setError}
      />
    </div>
  )
}
