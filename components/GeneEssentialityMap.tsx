import { useRef, useEffect, useState, memo } from "react";
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import { ChevronDown, Trash2, Download } from "lucide-react";

Chart.register(
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
  annotationPlugin
);

const API_URL = "https://api.platform.opentargets.org/api/v4/graphql";

interface GeneEssentialityChartProps {
  ensemblId: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

interface DataPoint {
  x: number;
  y: number;
  tissue: string;
  cellLine: string;
  depmapId: string;
  disease: string;
  expression: number | null;
  cellLineName: string;
  diseaseFromSource: string;
  geneEffect: number;
}

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchField: keyof DataPoint;
  onSearchFieldChange: (value: keyof DataPoint) => void;
}

const SearchBar = memo(
  ({
    searchTerm,
    onSearchChange,
    searchField,
    onSearchFieldChange,
  }: SearchBarProps) => (
    <div className="flex flex-col space-y-2 w-full max-w-md sm:w-auto mt-5">
      <div className="relative">
        <select
          value={searchField}
          onChange={(e) => onSearchFieldChange(e.target.value as keyof DataPoint)}
          className="block appearance-none cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-600 dark:text-gray-300 leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-transparent"
        >
          <option className="dark:text-gray-300 dark:bg-gray-800" value="depmapId">DepMap ID</option>
          <option className="dark:text-gray-300 dark:bg-gray-800" value="cellLineName">Cell Line Name</option>
          <option className="dark:text-gray-300 dark:bg-gray-800" value="diseaseFromSource">Disease</option>
          <option className="dark:text-gray-300 dark:bg-gray-800" value="geneEffect">Gene Effect</option>
          <option className="dark:text-gray-300 dark:bg-gray-800" value="expression">Expression</option>
        </select>

        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown className="w-5 h-5 mr-1 text-gray-500 dark:text-gray-300" aria-hidden="true" />
        </div>
      </div>

      <div className="relative rounded-lg">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block dark:bg-transparent dark:text-gray-300 dark:placeholder:text-gray-200 w-full px-3 py-2 border border-gray-300 leading-5 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search..."
        />
      </div>
    </div>
  )
);

const TissueDropdown = memo(
  ({
    tissues,
    selectedTissues,
    onTissueToggle,
  }: {
    tissues: string[];
    selectedTissues: string[];
    onTissueToggle: (tissue: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative inline-block text-left w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-48 px-4 py-2 text-gray-600 rounded-xl text-sm font-medium bg-white border dark:bg-transparent dark:text-gray-300 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Filter Tissues
          <ChevronDown className="w-5 h-5 ml-2 -mr" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800 rounded-xl">
            <div className="py-1 max-h-64 overflow-y-auto">
              {tissues.map((tissue, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-gray-300 cursor-pointer"
                  onClick={() => onTissueToggle(tissue)}
                >
                  <input
                    type="checkbox"
                    checked={selectedTissues.includes(tissue)}
                    onChange={() => onTissueToggle(tissue)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 flex-grow cursor-pointer">
                    {tissue}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export const GeneEssentialityChart = ({
  ensemblId,
  setLoading,
  setError,
}: GeneEssentialityChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [tissues, setTissues] = useState<string[]>([]);
  const [selectedTissues, setSelectedTissues] = useState<string[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);
  const [theme] = useState<"light" | "dark">("light");
  const chartRef = useRef<Chart<"scatter", any[], unknown> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<keyof DataPoint>("cellLineName");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  const exportToCSV = () => {
    if (!chartData || !chartData.datasets[0].data) return;

    const data = chartData.datasets[0].data;
    const headers = [
      "Tissue",
      "Cell Line",
      "DepMap ID",
      "Disease",
      "Gene Effect",
      "Expression"
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((point: DataPoint) => [
        `"${point.tissue}"`,
        `"${point.cellLine}"`,
        `"${point.depmapId}"`,
        `"${point.disease}"`,
        point.geneEffect,
        point.expression || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `gene-essentiality-data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchFieldChange = (value: keyof DataPoint) => {
    setSearchField(value);
  };

  const handleTissueToggle = (tissue: string) => {
    setSelectedTissues(
      (prev) =>
        prev.includes(tissue)
          ? prev.filter((t) => t !== tissue)
          : [tissue, ...prev]
    );
  };

  const getPointColor = (
    point: DataPoint,
    currentTheme: string | undefined,
    alpha = 0.6
  ) => {
    const isHighlighted =
      searchTerm &&
      String(point[searchField] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (selectedCategories.length > 0) {
      const matchesCategory = selectedCategories.some((category) => {
        if (category === "Neutral" && point.geneEffect > -1) return true;
        if (category === "Dependency" && point.geneEffect <= -1) return true;
        if (
          category === "Selected Neu" &&
          isHighlighted &&
          point.geneEffect > -1
        )
          return true;
        if (
          category === "Selected Dep" &&
          isHighlighted &&
          point.geneEffect <= -1
        )
          return true;
        return false;
      });

      if (!matchesCategory) {
        return "rgba(200, 200, 200, 0.1)";
      }
    }

    if (isHighlighted) {
      return point.geneEffect <= -1
        ? `rgba(234, 179, 8, 1)`
        : `rgba(34, 197, 94, 1)`;
    }

    return point.geneEffect <= -1
      ? `rgba(239, 68, 68, ${alpha})`
      : `rgba(59, 130, 246, ${alpha})`;
  };

  const getPointRadius = (point: DataPoint) => {
    const isHighlighted =
      searchTerm &&
      String(point[searchField] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const isSelected = selectedPoint?.depmapId === point.depmapId;
    
    if (isSelected) return 8;
    return isHighlighted ? 6 : 4;
  };

  const fetchData = async () => {
    if (!ensemblId) return;

    setLoading(true);
    setError("");
    setChartData(null);
    setTissues([]);
    setSelectedTissues([]);
    setOriginalData(null);
    setSearchTerm("");

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
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from Open Targets API");
      }

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (!data?.target?.depMapEssentiality) {
        throw new Error("No essentiality data found for this gene");
      }

      const essentialityData = data.target.depMapEssentiality;
      const uniqueTissues = Array.from(
        new Set(essentialityData.map((item: any) => item.tissueName))
      ) as string[];
      setTissues(uniqueTissues);

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
          }))
      );

      const newChartData = {
        datasets: [
          {
            label: "Gene Essentiality",
            data: scatterData,
            backgroundColor: scatterData.map((point: DataPoint) =>
              getPointColor(point, theme)
            ),
            borderColor: scatterData.map((point: DataPoint) =>
              getPointColor(point, theme, 1)
            ),
            borderWidth: 1,
            pointHoverRadius: 8,
            pointRadius: scatterData.map((point: DataPoint) =>
              getPointRadius(point)
            ),
            pointHoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
            pointHoverBorderColor: "rgba(0, 0, 0, 1)",
            pointHoverBorderWidth: 2,
          },
        ],
      };

      setChartData(newChartData);
      setOriginalData(newChartData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ensemblId) {
      fetchData();
    }
  }, [ensemblId]);

  useEffect(() => {
    if (originalData) {
      let filteredData = [...originalData.datasets[0].data];

      if (selectedTissues.length > 0) {
        filteredData = filteredData.filter((point: DataPoint) =>
          selectedTissues.includes(point.tissue)
        );
      }

      if (selectedCategories.length > 0) {
        filteredData = filteredData.filter((point: DataPoint) => {
          const isHighlighted =
            searchTerm &&
            String(point[searchField] || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          return selectedCategories.some((category) => {
            if (category === "Neutral") return point.geneEffect > -1;
            if (category === "Dependency") return point.geneEffect <= -1;
            if (category === "Selected Neu")
              return isHighlighted && point.geneEffect > -1;
            if (category === "Selected Dep")
              return isHighlighted && point.geneEffect <= -1;
            return false;
          });
        });
      }

      setChartData({
        datasets: [
          {
            ...originalData.datasets[0],
            data: filteredData,
            backgroundColor: filteredData.map((point: DataPoint) =>
              getPointColor(point, theme)
            ),
            borderColor: filteredData.map((point: DataPoint) =>
              getPointColor(point, theme, 1)
            ),
            pointRadius: filteredData.map((point: DataPoint) =>
              getPointRadius(point)
            ),
          },
        ],
      });
    }
  }, [
    selectedTissues,
    searchTerm,
    searchField,
    originalData,
    theme,
    selectedCategories,
    selectedPoint,
  ]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const dataIndex = elements[0].index;
        const clickedPoint = chartData.datasets[0].data[dataIndex];
        setSelectedPoint(prevPoint =>
          prevPoint?.depmapId === clickedPoint.depmapId ? null : clickedPoint
        );
      } else {
        setSelectedPoint(null);
      }
    },
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
          color: "#71717A",
        },
        ticks: {
          font: {
            size: 14,
            family: "Inter, sans-serif",
          },
          color: "#71717A",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
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
          color: "#71717A",
        },
        ticks: {
          callback: (value: number) => tissues[value] || "",
          stepSize: 0.5,
          autoSkip: false,
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
          color: "#71717A",
        },
        grid: {
          color: "rgba(107, 109, 105,0.1)",
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: true,
        position: 'nearest',
        external: (context: any) => {
          if (selectedPoint && context.tooltip.dataPoints) {
            const dataPoint = context.tooltip.dataPoints[0].raw;
            if (dataPoint.depmapId === selectedPoint.depmapId) {
              context.tooltip.opacity = 1;
            }
          }
        },
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return [
              `Tissue: ${point.tissue}`,
              `Cell Line: ${point.cellLine}`,
              `Gene Effect: ${point.x.toFixed(2)}`,
              `Disease: ${point.disease}`,
              `Expression: ${point.expression?.toFixed(2) || "N/A"}`,
              `DepMap ID: ${point.depmapId}`,
            ];
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 0.8)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: "rgba(255, 255, 255, 0.1)",
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
            borderColor: "rgba(239, 68, 68, 0.5)",
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
              color: "rgba(239, 68, 68, 1)",
            },
          },
        },
      },
    },
  };

  useEffect(() => {
    if (chartRef.current && selectedPoint) {
      const chart = chartRef.current;
      const dataset = chart.data.datasets[0];
      const index = dataset.data.findIndex((point: DataPoint) => 
        point.depmapId === selectedPoint.depmapId
      );
      
      if (index !== -1) {
        chart.setActiveElements([{ datasetIndex: 0, index }]);
        const meta = chart.getDatasetMeta(0);
        chart.tooltip?.setActiveElements([{ datasetIndex: 0, index }], {
          x: meta.data[index].x,
          y: meta.data[index].y,
        });
        chart.update();
      }
    }
  }, [selectedPoint]);

  return (
    <>
      <div className="flex items-center sm:space-y-4 lg:justify-start lg:space-x-4 lg:items-start w-[100%]">
        {chartData && (
          <>
            <div className="flex mr-4 flex-col relative left-0 top-0 items-start sm:space-y-4 dark:text-white lg:justify-start lg:space-x-4 lg:items-start h-[100%]">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 transition-colors ml-3 mt-4"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <div className="flex flex-col justify-center mt-4 border w-fit p-2 ml-3 border-gray-500 rounded-xl">
                {[
                  "Neutral",
                  "Dependency",
                  "Selected Neu",
                  "Selected Dep",
                ].map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-4 ml-3 dark:text-white"
                  >
                    <input
                      type="checkbox"
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(category)
                            ? prev.filter((c) => c !== category)
                            : [...prev, category]
                        );
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor={category}
                      className="flex items-center cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded-full dark:text-white mr-2 ${
                          category === "Neutral"
                            ? "bg-blue-400"
                            : category === "Dependency"
                            ? "bg-red-400"
                            : category === "Selected Neu"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <p
                        className={`text-gray-700 dark:text-gray-200 ${
                          selectedCategories.includes(category)
                            ? "font-bold"
                            : ""
                        }`}
                      >
                        {category}
                      </p>
                    </label>
                  </div>
                ))}
              </div>

              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                searchField={searchField}
                onSearchFieldChange={handleSearchFieldChange}
              />

              <div className="flex flex-col items-center mt-4">
                <div className="relative w-full">
                  <TissueDropdown
                    tissues={tissues.sort((a, b) => a.localeCompare(b))}
                    selectedTissues={selectedTissues.sort((a, b) => a.localeCompare(b))}
                    onTissueToggle={handleTissueToggle}
                  />
                </div>

                {tissues.length > 0 && (
                  <div className="mt-4 mr-3 relative">
                    {selectedTissues.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="gap-2 w-fit">
                            {selectedTissues
                              .sort((a, b) => a.localeCompare(b))
                              .map((tissue, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {tissue}
                                  <button
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:bg-gray-500 focus:text-white"
                                    onClick={() => handleTissueToggle(tissue)}
                                  >
                                    <span className="sr-only">
                                      Remove tissue filter
                                    </span>
                                    ×
                                  </button>
                                </span>
                              ))}
                          </div>
                          <button
                            onClick={() => setSelectedTissues([])}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-2 absolute right-0 top-[-5px]"
                            title="Clear all filters"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            <span className="sr-only">Clear all filters</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="relative h-[80vh] w-[100%] border-l-2 border-gray-500 p-2">
              <Scatter data={chartData} options={chartOptions} ref={chartRef} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GeneEssentialityChart;