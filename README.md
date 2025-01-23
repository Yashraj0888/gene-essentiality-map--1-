
---

# Gene Essentiality – Cancer DepMap Documentation

## Overview
The goal of this project is to build a web page that shows the gene essentiality map for a given gene target. The essentiality map will provide insights into the gene's importance for cell survival, especially in the context of cancer, by utilizing data from the Cancer Dependency Map (DepMap). Users will be able to input a gene's EnsemblID (ENSG) to fetch the corresponding essentiality data.

## Components and Prerequisites

### Components
The application will consist of the following major components:
- **Gene Input Field**: A form input that accepts the EnsemblID (e.g., ENSG00000012048 for BRCA1).
- **Gene Essentiality Map**: A visualization displaying the gene essentiality map based on the provided EnsemblID. The map will show the dependency of the gene across different cancer cell lines.
- **GraphQL API Integration**: A backend service that fetches the gene essentiality data from the DepMap GraphQL endpoint.
- **Tooltip**: Displays additional information about each data point when hovering over the map.
- **Error Handling**: Displays appropriate messages if the input is invalid or no data is returned for the given gene.

### Prerequisites
- **Node.js** and **npm** for managing the project.
- **React** and **Next.js** for front-end development.
- **GraphQL** for data fetching from the DepMap API.
- **Tailwind CSS** for styling the application (Highly Recommended).
- **ShadCN components** for reusable and visually appealing UI components.

### API Integration
You will use a GraphQL API to fetch the gene essentiality data. The sample JavaScript code to invoke the API is provided below. It should be adapted to meet the project's needs. The query will fetch data based on the provided EnsemblID and return the information needed to render the essentiality map.

#### API Endpoint

The API endpoint for fetching gene essentiality data is: 
```js
"https://api.platform.opentargets.org/api/v4/graphql"
```

#### Example API query:
```javascript
query Depmap ($ensemblId: String!) {
  target(ensemblId: $ensemblId) {
    id
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

//  Example query variables:

{
  "ensemblId": "ENSG00000012048"
}
```

## Gene IDs

You can test the application with the following genes and their corresponding EnsemblIDs:

- BRCA1: ENSG00000012048
- BRCA2: ENSG00000139618
- TP53: ENSG00000141510
- EGFR: ENSG00000146648

## Developer Instructions

### How Developers Use Components

* **Gene Input Field:** 
    * Developers must ensure the input field accepts a valid EnsemblID.
    * The `GeneEssentialityChart` component should receive props related to the EnsemblID, loading state, and error. Ideally, the `GeneSearchForm` component should properly pass these props to the `GeneEssentialityChart`.
    * `GeneEssentialityChart` should handle state updates and provide information to the form to display relevant UI hints for errors and loading states.

Example:
```js
"use client"

import { useState } from "react"
import { GeneSearchForm } from "./Form"
import { GeneEssentialityChart } from "@aganitha/GeneEssentialityMap"

export default function MainGeneMap() {
  const [ensemblId, setEnsemblId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
```

### How to Download the npm Package
If you directly download the package from the `https://npmboot.svc.aganitha.ai/` npm repository, it will not include all required dependencies, so it won't work properly.

To address this, follow these steps:

#### Step 1 - Set the registry to the main NPM repository
```sh
npm config set registry https://registry.npmjs.org/
```

#### Step 2 - Download the `gene-essentiality-chart` component from npm
```sh
npm i gene-essentiality-chart
```
*Use the `--force` flag if there are version clashes.*

#### Step 3 - Set the registry back to Aganitha
```sh
npm config set registry https://npmboot.svc.aganitha.ai/
```

#### Step 4 - Install the component from the Aganitha repository
```sh
npm install @aganitha/gene-essentiality-chart@1.0.0
```

#### Step 5 - Remove the package from the main npm repository
After ensuring all required dependencies are installed, remove the package initially downloaded from the main npm repository.

#### Step 6 - Import the package
```js
import { GeneEssentialityChart } from '@aganitha/gene-essentiality-chart'
```

*Note: Tailwind CSS is required for proper styling of this component.*

## Testing

The app should be tested with the following genes:

- BRCA1 (ENSG00000012048)
- BRCA2 (ENSG00000139618)
- TP53 (ENSG00000141510)
- EGFR (ENSG00000146648)

Ensure the following:
- The gene essentiality map renders correctly.
- The tooltip displays relevant data when hovering over the plot.
- Errors are handled gracefully, especially for invalid EnsemblIDs.

## SME Review

Once the initial documentation and design are complete, it should be shared with subject matter experts (SMEs) to verify:
- The project scope aligns with research goals.
- The chosen approach for data visualization and API integration is appropriate.

## Roles of Team Members

### Abhijeet (UI/UX Design)

Responsibilities:
- Design and implement the user interface (UI) of the application.
- Create a visually appealing and user-friendly experience.
- Develop the Gene Input Field component, ensuring it's reusable and handles valid EnsemblIDs.
- Collaborate with Yashraj to integrate UI elements with the application's functionalities.
- Ensure the UI is responsive and adapts well to different screen sizes.
- Conduct usability testing and gather user feedback to refine the UI.

### Yashraj (UI/UX, Functionality Developer)

Responsibilities:
- Develop the core functionalities of the application, including:
  - Integration with the GraphQL API to fetch gene essentiality data.
  - Implementation of the Gene Essentiality Map component, including data visualization and tooltip functionality.
  - Handle data fetching, processing, and state management.
  - Implement error handling and graceful degradation.
- Work with Abhijeet to ensure smooth integration of UI elements with the application's logic.
- Test the application thoroughly with the specified genes and edge cases.

### Shilpa (Documentation & Implementation)

Responsibilities:
- Maintain comprehensive documentation throughout the development process.
- Document design decisions, code structure, and API interactions.
- Create user manuals and tutorials to guide users on how to use the application.
- Assist with implementing the application, particularly in areas related to data management and API interactions.
- Ensure code quality and adherence to best practices.
- Collaborate with Abhijeet and Yashraj to resolve any technical issues or roadblocks.

### Collaboration

- Regular team meetings to discuss progress, address challenges, and ensure alignment.
- Code reviews to maintain code quality and readability.
- Shared responsibility for testing and debugging.




--- 
