import { useRef, useEffect, useState, memo, useCallback } from "react";
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";

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
// The `SearchBar` component is a memoized functional component that provides a search bar and dropdown menu for filtering data points in the `GeneEssentialityMap` component. It accepts the following props:

// - `searchTerm`: The current search term entered by the user.
// - `onSearchChange`: A callback function to update the search term.
// - `searchField`: The currently selected search field (e.g. "DepMap ID", "Cell Line Name", etc.).
// - `onSearchFieldChange`: A callback function to update the selected search field.

// The component manages the state of the dropdown menu using the `isDropdownOpen` state variable and the `handleSelectChange` and `handleBlur` callback functions. The dropdown menu allows the user to select the search field, and the search input field allows the user to enter a search term.

const SearchBar = memo(
  ({
    searchTerm,
    onSearchChange,
    searchField,
    onSearchFieldChange,
  }: SearchBarProps): JSX.Element => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSelectChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSearchFieldChange(e.target.value as keyof DataPoint);
        setIsDropdownOpen(false);
      },
      [onSearchFieldChange]
    );

    const handleBlur = useCallback(() => {
      requestAnimationFrame(() => {
        setIsDropdownOpen(false);
      });
    }, []);

    return (
      <div className="flex flex-col space-y-2 w-full max-w-md sm:w-auto mt-5">
        <div className="relative">
          <select
            value={searchField}
            onChange={handleSelectChange}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={handleBlur}
            className="block appearance-none cursor-pointer dark:bg-transparent w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-600 dark:text-gray-300 leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option
              value="depmapId"
              className="dark:text-gray-300 dark:bg-gray-800"
            >
              DepMap ID
            </option>
            <option
              value="cellLineName"
              className="dark:text-gray-300 dark:bg-gray-800"
            >
              Cell Line Name
            </option>
            <option
              value="diseaseFromSource"
              className="dark:text-gray-300 dark:bg-gray-800"
            >
              Disease
            </option>
            <option
              value="geneEffect"
              className="dark:text-gray-300 dark:bg-gray-800"
            >
              Gene Effect
            </option>
            <option
              value="expression"
              className="dark:text-gray-300 dark:bg-gray-800"
            >
              Expression
            </option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 ml-1 text-gray-500 dark:text-gray-300 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M19.53 8.47a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-7-7a.75.75 0 1 1 1.06-1.06L12 14.44l6.47-6.47a.75.75 0 0 1 1.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="relative rounded-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 leading-5 rounded-xl bg-white dark:bg-transparent dark:text-gray-300 placeholder-gray-500 dark:placeholder:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
    );
  });

SearchBar.displayName = "SearchBar";

interface TissueDropdownProps {
  tissues: string[];
  selectedTissues: string[];
  onTissueToggle: (tissue: string) => void;
}

// The `TissueDropdown` component is a reusable dropdown menu that allows users to select one or more tissues from a list. It is used within the `GeneEssentialityMap` component to filter the data displayed in the chart.

// The component takes in three props:
// - `tissues`: an array of strings representing the available tissues
// - `selectedTissues`: an array of strings representing the currently selected tissues
// - `onTissueToggle`: a function that is called when a tissue is selected or deselected, with the tissue name as the argument

// The component renders a button that, when clicked, opens a dropdown menu displaying the list of tissues. Users can select or deselect tissues by clicking the corresponding checkboxes. The dropdown menu is positioned absolutely and is closed when the user clicks outside of it.

// The component uses the `memo` higher-order component to memoize the component and prevent unnecessary re-renders.
const TissueDropdown = memo(
  ({ tissues, selectedTissues, onTissueToggle }: TissueDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative inline-block text-left w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-gray-600 rounded-xl text-sm font-medium bg-white border dark:bg-transparent dark:text-gray-300 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Filter Tissues
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M19.53 8.47a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-7-7a.75.75 0 1 1 1.06-1.06L12 14.44l6.47-6.47a.75.75 0 0 1 1.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute  mt-2  bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800 rounded-xl">
            <div className="py-1 max-h-64 overflow-y-auto">
              {tissues.map((tissue, index) => (
                <label
                  key={index}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTissues.includes(tissue)}
                    onChange={() => onTissueToggle(tissue)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="ml-3 flex-grow">{tissue}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TissueDropdown.displayName = "TissueDropdown";

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
  const [searchField, setSearchField] =
    useState<keyof DataPoint>("cellLineName");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const previousWidthRef = useRef(sidebarWidth);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {


    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= window.innerWidth * 0.8) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (isSidebarCollapsed) {
      setSidebarWidth(previousWidthRef.current);
    } else {
      previousWidthRef.current = sidebarWidth;
      setSidebarWidth(40);
    }
  };

  const exportToCSV = () => {
    if (!chartData || !chartData.datasets[0].data) return;

    const data = chartData.datasets[0].data;
    const headers = [
      "Tissue",
      "Cell Line",
      "DepMap ID",
      "Disease",
      "Gene Effect",
      "Expression",
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((point: DataPoint) =>
        [
          `"${point.tissue}"`,
          `"${point.cellLine}"`,
          `"${point.depmapId}"`,
          `"${point.disease}"`,
          point.geneEffect,
          point.expression || "N/A",
        ].join(",")
      ),
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
    setSelectedTissues((prev) =>
      prev.includes(tissue)
        ? prev.filter((t) => t !== tissue)
        : [tissue, ...prev]
    );
  };
  const getPointColor = (
    point: DataPoint,
    currentTheme: string | undefined,
    alpha = 0.6  // Default alpha for initial state
  ) => {
    // Base colors with specified alpha values
    const colors = {
      dependency: {
        normal: `rgba(239, 68, 68, ${alpha})`,    // Initial alpha 0.6
        faded: 'rgba(239, 68, 68, 0.1)',          // Faded state alpha 0.4
        highlighted: 'rgba(234, 179, 8, 0.8)',       // Highlighted stays full opacity
      },
      neutral: {
        normal: `rgba(59, 130, 246, ${alpha})`,   // Initial alpha 0.6
        faded: 'rgba(59, 130, 246, 0.1)',         // Faded state alpha 0.4
        highlighted: 'rgba(34, 197, 94, 0.8)',       // Highlighted stays full opacity
      }
    };
  
    const isHighlighted = searchTerm && 
      String(point[searchField] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
  
    const isDependency = point.geneEffect <= -1;
    const colorSet = isDependency ? colors.dependency : colors.neutral;
  
    // If we have active category filters
    if (selectedCategories.length > 0) {
      const matchesCategory = selectedCategories.some(category => {
        switch (category) {
          case "Neutral":
            return point.geneEffect > -1;
          case "Dependency":
            return point.geneEffect <= -1;
          case "Selected Neu":
            return isHighlighted && point.geneEffect > -1;
          case "Selected Dep":
            return isHighlighted && point.geneEffect <= -1;
          default:
            return false;
        }
      });
  
      // If point doesn't match any selected category, return faded color (0.5)
      if (!matchesCategory) {
        return colorSet.faded;
      }
  
      // If point matches and is highlighted, return highlighted color
      if (isHighlighted) {
        return colorSet.highlighted;
      }
  
      // If point matches but isn't highlighted, return normal color (0.6)
      return colorSet.normal;
    }
  
    // If no categories are selected but there's a search term
    if (searchTerm) {
      return isHighlighted ? colorSet.highlighted : colorSet.faded;
    }
  
    // Default case: no filters active (0.6)
    return colorSet.normal;
  };
  
  // Update the chart dataset to use the new color system
  useEffect(() => {
    if (originalData) {
      let filteredData = [...originalData.datasets[0].data];
  
      // Apply tissue filter if any
      if (selectedTissues.length > 0) {
        filteredData = filteredData.filter((point: DataPoint) =>
          selectedTissues.includes(point.tissue)
        );
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
            borderWidth: filteredData.map((point: DataPoint) =>
              String(point[searchField] || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ? 2 : 1
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
        setSelectedPoint((prevPoint) =>
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
        mode: "nearest",
        intersect: true,
        position: "nearest",
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
      const index = dataset.data.findIndex(
        (point: DataPoint) => point.depmapId === selectedPoint.depmapId
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
    <div className="flex h-screen w-full">
      <div
        style={{
          width: `${sidebarWidth}px`,
          minWidth: isSidebarCollapsed ? "40px" : "200px",
          maxWidth: "80%",
          transition: isResizing ? "none" : "width 0.3s ease",
        }}
        className="flex flex-col bg-transparent dark:bg-transparent border-r border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-transparent rounded-full focus:outline-none"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className={`w-6 h-6 dark:text-gray-900 transition-transform duration-300 ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto ${
            isSidebarCollapsed ? "hidden" : ""
          }`}
        >
          {chartData && (
            <div className="p-4 space-y-4">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 0 1 .75.75v9.69l3.22-3.22a.75.75 0 0 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V4.5a.75.75 0 0 1 .75-.75zM4.5 18a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25A.75.75 0 0 1 4.5 18z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Export CSV</span>
              </button>

              <div className="border rounded-xl p-4 space-y-2">
                {["Neutral", "Dependency", "Selected Neu", "Selected Dep"].map(
                  (category) => (
                    <div key={category} className="flex items-center space-x-3">
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
                        className="flex items-center cursor-pointer text-sm"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            category === "Neutral"
                              ? "bg-blue-400"
                              : category === "Dependency"
                              ? "bg-red-400"
                              : category === "Selected Neu"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        {category}
                      </label>
                    </div>
                  )
                )}
              </div>

              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                searchField={searchField}
                onSearchFieldChange={handleSearchFieldChange}
              />

              <TissueDropdown
                tissues={tissues}
                selectedTissues={selectedTissues}
                onTissueToggle={handleTissueToggle}
              />

              {selectedTissues.length > 0 && (
                <div className="border rounded-xl p-4 relative">
                  <div className="flex flex-wrap gap-2 pr-8">
                    {selectedTissues.map((tissue) => (
                      <span
                        key={tissue}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tissue}
                        <button
                          onClick={() => handleTissueToggle(tissue)}
                          className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedTissues([])}
                    className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="Clear all filters"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-red-500 hover:text-red-700"
                      aria-hidden="true"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    <span className="sr-only">Clear all filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={resizeRef}
        className="w-1 cursor-col-resize bg-gray-200 hover:bg-blue-500 active:bg-blue-600 transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      <div className="flex-1 overflow-hidden">
        {chartData && (
          <div className="h-full w-full p-4">
            <Scatter data={chartData} options={chartOptions} ref={chartRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneEssentialityChart;
