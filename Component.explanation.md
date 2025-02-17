# Gene Essentiality Chart Documentation

## Overview
The Gene Essentiality Chart is a sophisticated React component that visualizes gene essentiality data using a scatter plot. It provides interactive features for data exploration, filtering, and analysis of gene dependencies across different cell lines and tissues.

## Filtering System

### 1. Search Filtering
The search system allows users to filter data points based on multiple fields:

#### Search Fields
- Cell Line Name
- DepMap ID
- Disease
- Gene Effect
- Expression

#### Search Implementation
```typescript
// Search state management
const [searchTerm, setSearchTerm] = useState("");
const [searchField, setSearchField] = useState<keyof DataPoint>("cellLineName");

// Search filtering logic
const isHighlighted = searchTerm && 
  String(point[searchField] || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
```

The search system works by:
1. Maintaining the current search term and selected field in state
2. Converting both the search term and field value to lowercase for case-insensitive comparison
3. Using string inclusion to match partial terms
4. Applying visual highlighting to matched points
5. Integrating with the category system for combined filtering

### 2. Tissue Filtering
The tissue filtering system allows users to filter data points by specific tissues:

#### Implementation
```typescript
// Tissue state management
const [tissues, setTissues] = useState<string[]>([]);
const [selectedTissues, setSelectedTissues] = useState<string[]>([]);

// Tissue toggle handler
const handleTissueToggle = (tissue: string) => {
  setSelectedTissues((prev) =>
    prev.includes(tissue)
      ? prev.filter((t) => t !== tissue)  // Remove if already selected
      : [tissue, ...prev]                 // Add if not selected
  );
};
```

The tissue filtering process:
1. Extracts unique tissues from the dataset
2. Maintains a list of selected tissues
3. Allows multiple tissue selection
4. Updates the visualization in real-time
5. Provides visual feedback for selected tissues

### 3. Category Filtering
The category system provides predefined filters based on gene dependency status:

#### Categories
- **Neutral**: Points with gene effect > -1
- **Dependency**: Points with gene effect ≤ -1
- **Selected Neu**: Highlighted neutral points
- **Selected Dep**: Highlighted dependency points

#### Implementation
```typescript
// Category state
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

// Category filtering logic
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
```

### 4. Combined Filtering System
The chart implements a sophisticated multi-layer filtering system:

```typescript
useEffect(() => {
  if (originalData) {
    let filteredData = [...originalData.datasets[0].data];

    // 1. Apply tissue filter
    if (selectedTissues.length > 0) {
      filteredData = filteredData.filter((point: DataPoint) =>
        selectedTissues.includes(point.tissue)
      );
    }

    // 2. Apply category filter
    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter((point: DataPoint) => {
        const isHighlighted = searchTerm &&
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

    // 3. Update chart with filtered data
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
```

The filtering process follows these steps:
1. Start with original, unfiltered data
2. Apply tissue filters if any are selected
3. Apply category filters if any are selected
4. Apply search highlighting
5. Update visual properties (colors, sizes) based on filter state
6. Update the chart with the filtered dataset

### 5. Visual Feedback System

#### Point Colors
The color system provides visual feedback for different states:
```typescript
const colors = {
  dependency: {
    normal: `rgba(239, 68, 68, ${alpha})`,    // Red for dependent genes
    faded: 'rgba(239, 68, 68, 0.1)',          // Faded state
    highlighted: 'rgba(234, 179, 8, 0.8)',    // Highlighted state
  },
  neutral: {
    normal: `rgba(59, 130, 246, ${alpha})`,   // Blue for neutral genes
    faded: 'rgba(59, 130, 246, 0.1)',         // Faded state
    highlighted: 'rgba(34, 197, 94, 0.8)',    // Highlighted state
  }
};
```

#### Point Sizes
Points change size based on their state:
```typescript
const getPointRadius = (point: DataPoint) => {
  const isHighlighted = searchTerm &&
    String(point[searchField] || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  const isSelected = selectedPoint?.depmapId === point.depmapId;

  if (isSelected) return 8;      // Largest size for selected points
  return isHighlighted ? 6 : 4;  // Medium size for highlighted, small for normal
};
```

### 6. Filter Reset Functionality

#### Tissue Filter Reset
```typescript
const clearTissueFilters = () => {
  setSelectedTissues([]);
};
```

#### Search Reset
```typescript
const clearSearch = () => {
  setSearchTerm("");
};
```

#### Category Reset
```typescript
const clearCategories = () => {
  setSelectedCategories([]);
};
```

## Best Practices for Filtering

### 1. Performance Optimization
- Use memoization for filter components
- Implement debouncing for search input
- Cache filtered results when possible
- Use efficient data structures for lookups

### 2. User Experience
- Provide immediate visual feedback
- Maintain smooth animations
- Show clear filter state indicators
- Allow easy filter reset

### 3. Accessibility
- Keyboard navigation for filters
- Screen reader support
- Clear focus indicators
- Semantic HTML structure

### 4. Error Handling
- Validate filter inputs
- Handle edge cases
- Provide fallback states
- Clear error messages

## Usage Example with Filters
```tsx
// Example of using the chart with all filters
<GeneEssentialityChart
  ensemblId="ENSG00000141510"
  setLoading={(loading) => console.log('Loading:', loading)}
  setError={(error) => console.error('Error:', error)}
/>

// The chart will automatically handle:
// - Tissue filtering
// - Search functionality
// - Category filtering
// - Visual feedback
// - Filter state management
```