"use client"

import { useRef, useEffect, useState } from "react"
import { Chart, ScatterController, LinearScale, PointElement, Tooltip } from "chart.js"
import { Scatter } from "react-chartjs-2"
import annotationPlugin from "chartjs-plugin-annotation"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, annotationPlugin)

const API_URL = "https://api.platform.opentargets.org/api/v4/graphql"


interface GeneEssentialityChartProps {
  ensemblId: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}


export const GeneEssentialityChart = ({
  ensemblId,
  setLoading,
  setError

}: GeneEssentialityChartProps) => {
  const [chartData, setChartData] = useState<any>(null)
  const [tissues, setTissues] = useState<string[]>([])
  const [selectedTissues, setSelectedTissues] = useState<string[]>([])
  const [originalData, setOriginalData] = useState<any>(null)
  const chartRef = useRef<Chart | null>(null)
  const { theme } = useTheme()
  
  const fetchData = async () => {
    if (!ensemblId) return;
    
    setLoading(true)
    setError("")
    setChartData(null)
    setTissues([])
    setSelectedTissues([])
    setOriginalData(null)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query Depmap($ensemblId: String!) {
              target(ensemblId: $ensemblId) {
                depMapEssentiality {
                  tissueName
                  screens {
                    depmapId
                    cellLineName
                    diseaseFromSource
                    geneEffect
                    expression
                  }
                }
              }
            }
          `,
          variables: { ensemblId },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch data from Open Targets API")
      }

      const { data, errors } = await response.json()

      if (errors) {
        throw new Error(errors[0].message)
      }

      if (!data?.target?.depMapEssentiality) {
        throw new Error("No essentiality data found for this gene")
      }

      const essentialityData = data.target.depMapEssentiality
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

  useEffect(() => {
  
      fetchData()
    
  }, [ensemblId])

  useEffect(() => {
    if (originalData && selectedTissues.length > 0) {
      const filteredData = originalData.datasets[0].data.filter((point: any) =>
        selectedTissues.includes(point.tissue)
      )
      setChartData({
        datasets: [
          {
            ...originalData.datasets[0],
            data: filteredData,
            backgroundColor: filteredData.map((point: any) => getPointColor(point.x, theme)),
            borderColor: filteredData.map((point: any) => getPointColor(point.x, theme, 1)),
          },
        ],
      })
    } else if (originalData) {
      setChartData(originalData)
    }
  }, [selectedTissues, originalData, theme])

  const toggleTissueSelection = (tissue: string) => {
    setSelectedTissues((prev) => (prev.includes(tissue) ? prev.filter((t) => t !== tissue) : [...prev, tissue]))
  }

  const getPointColor = (geneEffect: number, currentTheme: string | undefined, alpha = 0.6) => {
    return geneEffect <= -1
      ? `rgba(239, 68, 68, ${alpha})`
      : `rgba(59, 130, 246, ${alpha})`
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
            weight: "bold" as const,
            family: "Inter, sans-serif",
          },
          color: theme === "dark" ? "#E5E7EB" : "#1F2937",
        },
        ticks: {
          font: {
            size: 14,
            family: "Inter, sans-serif",
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
            weight: "bold" as const,
            family: "Inter, sans-serif",
          },
          color: theme === "dark" ? "#E5E7EB" : "#1F2937",
        },
        ticks: {
          callback: (value: number) => tissues[value] || "",
          stepSize: 0.5,
          autoSkip: false,
          font: {
            size: 12,
            family: "Inter, sans-serif",
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
          weight: "bold" as const,
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
                weight: "bold" as const,
              },
              color: theme === "dark" ? "rgba(239, 68, 68, 1)" : "rgba(185, 28, 28, 1)",
            },
          },
        },
      },
    },
  }

  const TissueDropdown = () => {
    return (
      <DropdownMenu >
        <DropdownMenuTrigger className="rounded-xl" asChild>
          <Button variant="outline" className="w-48 justify-between">
            Filter Tissues
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 dark:text-white">
          <DropdownMenuLabel>Select Tissues</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tissues.map((tissue, index) => (
            <DropdownMenuCheckboxItem
              key={index}
              checked={selectedTissues.includes(tissue)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedTissues((prev) => [...prev, tissue]);
                } else {
                  setSelectedTissues((prev) => prev.filter((t) => t !== tissue));
                }
              }}
            >
              {tissue}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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
      {tissues.length > 0 && (
        <div className="mt-4">
          <TissueDropdown />

          {selectedTissues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTissues.map((tissue, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-2 py-1"
                  onClick={() => toggleTissueSelection(tissue)}
                >
                  {tissue}
                  <button
                    className="ml-1 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTissueSelection(tissue)
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {chartData && (
        <>
          <div className="flex flex-col justify-center mt-4">
            <div className="flex justify-center mt-4 border w-fit p-2 border-gray-500 rounded-xl">
              <div className="flex items-center space-x-4">
                <button className="w-4 h-4 bg-blue-400 rounded-full"></button>
                <p className="text-gray-700 dark:text-gray-200">Neutral</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="w-4 h-4 bg-red-400 rounded-full ml-4"></button>
                <p className="text-gray-700 dark:text-gray-200">Dependency</p>
              </div>
            </div>
            <div>
              <h1 className="text-center mt-4 text-2xl font-bold">
                Gene Effect/Tissues Dependency Chart
              </h1>
            </div>
          </div>
          <div className="relative h-[90vh]">
            <Scatter data={chartData} options={chartOptions} ref={chartRef} />
          </div>
        </>
      )}
    </>
  )
}