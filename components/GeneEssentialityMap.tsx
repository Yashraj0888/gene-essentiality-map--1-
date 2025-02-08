import { useRef, useEffect, useState, memo } from "react"
import { Chart, ScatterController, LinearScale, PointElement, Tooltip } from "chart.js"
import { Scatter } from "react-chartjs-2"
import annotationPlugin from "chartjs-plugin-annotation"
import { ChevronDown } from "lucide-react"
import React from "react"

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, annotationPlugin)

const API_URL = "https://api.platform.opentargets.org/api/v4/graphql"

interface GeneEssentialityChartProps {
  ensemblId: string
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
}

interface DataPoint {
  x: number
  y: number
  tissue: string
  cellLine: string
  depmapId: string
  disease: string
  expression: number | null
  cellLineName: string
  diseaseFromSource: string
  geneEffect: number
}

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  searchField: keyof DataPoint
  onSearchFieldChange: (value: keyof DataPoint) => void
}

// Memoized SearchBar component
const SearchBar = memo(({ searchTerm, onSearchChange, searchField, onSearchFieldChange }: SearchBarProps) => (
  <div className="flex flex-col space-y-2 w-full max-w-md sm:w-auto mt-5">
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Search..."
      />
    </div>
    <select
      value={searchField}
      onChange={(e) => onSearchFieldChange(e.target.value as keyof DataPoint)}
      className="block w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      <option value="depmapId">DepMap ID</option>
      <option value="cellLineName">Cell Line Name</option>
      <option value="diseaseFromSource">Disease</option>
      <option value="geneEffect">Gene Effect</option>
      <option value="expression">Expression</option>
    </select>
  </div>
))

// Memoized TissueDropdown component
const TissueDropdown = memo(
  ({
    tissues,
    selectedTissues,
    onTissueToggle,
  }: {
    tissues: string[]
    selectedTissues: string[]
    onTissueToggle: (tissue: string) => void
  }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Filter Tissues
          <ChevronDown className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1 max-h-64 overflow-y-auto">
              {tissues.map((tissue, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onTissueToggle(tissue)
                    setIsOpen(false)
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTissues.includes(tissue)}
                    readOnly
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <span className="ml-3">{tissue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)

export const GeneEssentialityChart = ({ ensemblId, setLoading, setError }: GeneEssentialityChartProps) => {
  const [chartData, setChartData] = useState<any>(null)
  const [tissues, setTissues] = useState<string[]>([])
  const [selectedTissues, setSelectedTissues] = useState<string[]>([])
  const [originalData, setOriginalData] = useState<any>(null)
  const [theme] = useState<"light" | "dark">("light")
  const chartRef = useRef<Chart<"scatter", any[], unknown> | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState<keyof DataPoint>("cellLineName")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearchFieldChange = (value: keyof DataPoint) => {
    setSearchField(value)
  }

  const handleTissueToggle = (tissue: string) => {
    setSelectedTissues(
      (prev) =>
        prev.includes(tissue)
          ? prev.filter((t) => t !== tissue) // Remove if already selected
          : [tissue, ...prev], // Prepend instead of appending
    )
  }

  const getPointColor = (point: DataPoint, currentTheme: string | undefined, alpha = 0.6) => {
    const isHighlighted =
      searchTerm &&
      String(point[searchField] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    if (selectedCategory) {
      if (selectedCategory === "Neutral" && point.geneEffect > -1) {
        return `rgba(59, 130, 246, ${alpha})`
      }
      if (selectedCategory === "Dependency" && point.geneEffect <= -1) {
        return `rgba(239, 68, 68, ${alpha})`
      }
      if (selectedCategory === "Highlighted Neutral" && isHighlighted && point.geneEffect > -1) {
        return `rgba(34, 197, 94, 1)`
      }
      if (selectedCategory === "Highlighted Dependency" && isHighlighted && point.geneEffect <= -1) {
        return `rgba(234, 179, 8, 1)`
      }
      return "rgba(200, 200, 200, 0.1)" // Gray out non-selected points
    }

    if (isHighlighted) {
      return point.geneEffect <= -1
        ? `rgba(234, 179, 8, 1)` // Yellow for highlighted dependency
        : `rgba(34, 197, 94, 1)` // Green for highlighted neutral
    }

    return point.geneEffect <= -1
      ? `rgba(239, 68, 68, ${alpha})` // Regular red for dependency
      : `rgba(59, 130, 246, ${alpha})` // Regular blue for neutral
  }

  const getPointRadius = (point: DataPoint) => {
    const isHighlighted =
      searchTerm &&
      String(point[searchField] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    return isHighlighted ? 6 : 4
  }

  const fetchData = async () => {
    if (!ensemblId) return

    setLoading(true)
    setError("")
    setChartData(null)
    setTissues([])
    setSelectedTissues([])
    setOriginalData(null)
    setSearchTerm("")

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
      const uniqueTissues = Array.from(new Set(essentialityData.map((item: any) => item.tissueName))) as string[]
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
            cellLineName: screen.cellLineName,
            diseaseFromSource: screen.diseaseFromSource,
            geneEffect: screen.geneEffect,
          })),
      )

      const newChartData = {
        datasets: [
          {
            label: "Gene Essentiality",
            data: scatterData,
            backgroundColor: scatterData.map((point: DataPoint) => getPointColor(point, theme)),
            borderColor: scatterData.map((point: DataPoint) => getPointColor(point, theme, 1)),
            borderWidth: 1,
            pointHoverRadius: 8,
            pointRadius: scatterData.map((point: DataPoint) => getPointRadius(point)),
            pointHoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
            pointHoverBorderColor: "rgba(0, 0, 0, 1)",
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
    if (ensemblId) {
      fetchData()
    }
  }, [ensemblId])

  useEffect(() => {
    if (originalData) {
      let filteredData = [...originalData.datasets[0].data]

      if (selectedTissues.length > 0) {
        filteredData = filteredData.filter((point: DataPoint) => selectedTissues.includes(point.tissue))
      }

      if (selectedCategory) {
        filteredData = filteredData.filter((point: DataPoint) => {
          const isHighlighted =
            searchTerm &&
            String(point[searchField] || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          if (selectedCategory === "Neutral") return point.geneEffect > -1
          if (selectedCategory === "Dependency") return point.geneEffect <= -1
          if (selectedCategory === "Highlighted Neutral") return isHighlighted && point.geneEffect > -1
          if (selectedCategory === "Highlighted Dependency") return isHighlighted && point.geneEffect <= -1
          return true
        })
      }

      setChartData({
        datasets: [
          {
            ...originalData.datasets[0],
            data: filteredData,
            backgroundColor: filteredData.map((point: DataPoint) => getPointColor(point, theme)),
            borderColor: filteredData.map((point: DataPoint) => getPointColor(point, theme, 1)),
            pointRadius: filteredData.map((point: DataPoint) => getPointRadius(point)),
          },
        ],
      })
    }
  }, [selectedTissues, searchTerm, searchField, originalData, theme, selectedCategory])

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
          color: "#1F2937",
        },
        ticks: {
          font: {
            size: 14,
            family: "Inter, sans-serif",
          },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
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
          color: "#1F2937",
        },
        ticks: {
          callback: (value: number) => tissues[value] || "",
          stepSize: 0.5,
          autoSkip: false,
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
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
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        titleColor: "#000000",
        bodyColor: "#1F2937",
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
      annotation: {
        annotations: {
          line1: {
            type: "line" as const,
            yMin: -0.5,
            yMax: tissues.length - 0.5,
            xMin: -1,
            xMax: -1,
            borderColor: "rgba(185, 28, 28, 0.5)",
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
              color: "rgba(185, 28, 28, 1)",
            },
          },
        },
      },
    },
  }

  return (
    <>
      {chartData && (
        <>
          <div className="flex flex-col items-center sm:space-y-4 lg:flex-row lg:justify-between lg:space-x-4 lg:items-center m-auto w-[90%]">
            <div className="flex flex-col justify-center mt-4 border w-fit p-2 ml-3 border-gray-500 rounded-xl">
              {["Neutral", "Dependency", "Highlighted Neutral", "Highlighted Dependency"].map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-4 ml-4 cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      category === "Neutral"
                        ? "bg-blue-400"
                        : category === "Dependency"
                          ? "bg-red-400"
                          : category === "Highlighted Neutral"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                    } ${selectedCategory === category ? "ring-2 ring-black" : ""}`}
                  ></div>
                  <p className={`text-gray-700 ${selectedCategory === category ? "font-bold" : ""}`}>{category}</p>
                </div>
              ))}
            </div>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              searchField={searchField}
              onSearchFieldChange={handleSearchFieldChange}
            />
            {tissues.length > 0 && (
              <div className="mt-4 mr-3">
                <TissueDropdown
                  tissues={tissues}
                  selectedTissues={selectedTissues}
                  onTissueToggle={handleTissueToggle}
                />

                {selectedTissues.length > 0 && (
                  <div className="mt-2 flex flex-col flex-wrap gap-2 w-fit ">
                    {selectedTissues.map((tissue, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tissue}
                        <button
                          type="button"
                          className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:bg-gray-500 focus:text-white"
                          onClick={() => handleTissueToggle(tissue)}
                        >
                          <span className="sr-only">Remove tissue filter</span>×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative h-[90vh] m-auto w-[90%]">
            <Scatter data={chartData} options={chartOptions} ref={chartRef} />
          </div>
        </>
      )}
    </>
  )
}

export default GeneEssentialityChart

