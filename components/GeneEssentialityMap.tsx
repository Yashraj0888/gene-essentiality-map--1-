"use client"

import { useState, useRef, useEffect } from "react"
import { Chart, ScatterController, LinearScale, PointElement, Tooltip } from "chart.js"
import { Scatter } from "react-chartjs-2"
import annotationPlugin from "chartjs-plugin-annotation"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, annotationPlugin)

export default function GeneEssentialityMap() {
  const [ensemblId, setEnsemblId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<any>(null)
  const [tissues, setTissues] = useState<string[]>([])
  const [selectedTissues, setSelectedTissues] = useState<string[]>([])
  const [originalData, setOriginalData] = useState<any>(null)
  const chartRef = useRef<Chart | null>(null)
  const { theme } = useTheme()

  const fetchData = async () => {
    setLoading(true)
    setError("")
    setChartData(null)
    setTissues([]) 
    setSelectedTissues([])
    setOriginalData(null)

    try {
      const response = await fetch("/api/fetchEssentialityData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ensemblId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const essentialityData = data.essentialityData
      const uniqueTissues = [...new Set(essentialityData.map((item: any) => item.tissueName))]
      setTissues(uniqueTissues)

      const scatterData = essentialityData.flatMap((item: any) =>
        item.screens
          .filter((screen: any) => screen.geneEffect !== null)
          .map((screen: any) => ({
            x: screen.geneEffect,
            y: uniqueTissues.indexOf(item.tissueName),
            tissue: item.tissueName,
            cellLine: screen.cellLineName,
            depmapId: screen.depmapId,
            disease: screen.diseaseFromSource,
            expression: screen.expression,
          }))
      )

      const newChartData = {
        datasets: [
          {
            label: "Gene Essentiality",
            data: scatterData,
            backgroundColor: scatterData.map((point: any) => getPointColor(point.x, theme)),
            borderColor: scatterData.map((point: any) => getPointColor(point.x, theme, 1)),
            borderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
            pointHoverBorderColor: theme === "dark" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
            pointHoverBorderWidth: 2,
          },
        ],
      }

      setChartData(newChartData)
      setOriginalData(newChartData)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while fetching data.")
    } finally {
      setLoading(false)
    }
  }

  const getPointColor = (geneEffect: number, currentTheme: string | undefined, alpha = 0.6) => {
    if (geneEffect <= -1) {
      return `rgba(239, 68, 68, ${alpha})` // Red for dependency
    } else {
      return `rgba(59, 130, 246, ${alpha})` // Blue for non-dependency
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Gene Effect",
          font: {
            size: 16,
            weight: "bold",
            family: "Inter, sans-serif", // Custom font
          },
          color: theme === "dark" ? "#E5E7EB" : "#1F2937",
        },
        ticks: {
          font: {
            size: 14,
            family: "Inter, sans-serif", // Custom font
          },
          color: theme === "dark" ? "#D1D5DB" : "#4B5563",
        },
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Tissues",
          font: {
            size: 16,
            weight: "bold",
            family: "Inter, sans-serif", // Custom font
          },
          color: theme === "dark" ? "#E5E7EB" : "#1F2937",
        },
        ticks: {
          callback: (value: number) => tissues[value] || "",
          stepSize: 0.5,
          autoSkip: false,
          font: {
            size: 12,
            family: "Inter, sans-serif", // Custom font
          },
          color: theme === "dark" ? "#D1D5DB" : "#4B5563",
        },
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw
            return [
              `Tissue: ${point.tissue}`,
              `Cell Line: ${point.cellLine}`,
              `Gene Effect: ${point.x.toFixed(2)}`,
              `Disease: ${point.disease}`,
              `Expression: ${point.expression?.toFixed(2) || "N/A"}`,
              `DepMap ID: ${point.depmapId}`,
            ]
          },
        },
        backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: theme === "dark" ? "#FFFFFF" : "#000000",
        bodyColor: theme === "dark" ? "#E5E7EB" : "#1F2937",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
      annotation: {
        annotations: {
          line1: {
            type: "line",
            yMin: -0.5,
            yMax: tissues.length - 0.5,
            xMin: -1,
            xMax: -1,
            borderColor: theme === "dark" ? "rgba(239, 68, 68, 0.5)" : "rgba(185, 28, 28, 0.5)",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: "Essentiality Threshold",
              enabled: true,
              position: "start",
              font: {
                size: 14,
                weight: "bold",
              },
              color: theme === "dark" ? "rgba(239, 68, 68, 1)" : "rgba(185, 28, 28, 1)",
            },
          },
        },
      },
    },
  }

  const toggleTissueSelection = (tissue: string) => {
    setSelectedTissues((prev) => (prev.includes(tissue) ? prev.filter((t) => t !== tissue) : [...prev, tissue]))
  }

  useEffect(() => {
    if (originalData && selectedTissues.length > 0) {
      const filteredData = originalData.datasets[0].data.filter((point: any) =>
        selectedTissues.includes(point.tissue)
      )
      setChartData({
        datasets: [
          {
            label: "Gene Essentiality",
            data: filteredData,
            backgroundColor: filteredData.map((point: any) => getPointColor(point.x, theme)),
            borderColor: filteredData.map((point: any) => getPointColor(point.x, theme, 1)),
            borderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
            pointHoverBorderColor: theme === "dark" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
            pointHoverBorderWidth: 2,
          },
        ],
      })
    } else if (originalData) {
      setChartData(originalData)
    }
  }, [selectedTissues, originalData, theme])

  return (
    <>
      <div className="space-y-4  ">
        <Card className=" border-gray-800 rounded-2xl dark:border-white">
          <CardHeader>
            <CardTitle>Gene Essentiality Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 items-center border-gray-800 rounded-full">
              <Input
                placeholder="Enter Ensembl Gene ID"
                value={ensemblId}
                onChange={(e) => setEnsemblId(e.target.value)}
                className="w-5/6 border-gray-600 rounded-full focus:border-gray-600 focus:ring-gray-600"
              />
              <button
                onClick={fetchData}
                disabled={loading}

                className="bg-black text-white rounded-xl p-2 px-2 hover:bg-gray-600 transition-colors duration-200 dark:bg-white text-black" 
              >
                {loading ? "Loading..." : "Fetch Data"}
              </button>
            </div>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {tissues.length > 0 && (
  <div className="mt-4">
    <div className="flex flex-wrap space-x-2">
      {tissues.map((tissue, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => toggleTissueSelection(tissue)}
          className={`rounded-full m-2 
            ${selectedTissues.includes(tissue) ? 
              "bg-black text-white border-black" : 
              "bg-white text-black border-gray-600"} dark:bg-gray-200 dark: text-black`}
        >
          {tissue}
        </Button>
      ))}
    </div>
  </div>
)}

        {chartData && (
          <div className="relative h-[90vh]">
            <Scatter data={chartData} options={chartOptions} ref={chartRef} />
          </div>
        )}
        
      </div>
    </>
  )
}
