import { NextResponse } from "next/server"

const API_URL = "https://api.platform.opentargets.org/api/v4/graphql"

export async function POST(request: Request) {
  const { ensemblId } = await request.json()

  if (!ensemblId) {
    return NextResponse.json({ error: "Please provide a valid Ensembl ID." }, { status: 400 })
  }

  const query = `
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
  `

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { ensemblId } }),
    })

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    const essentialityData = data.data.target.depMapEssentiality

    if (!essentialityData || essentialityData.length === 0) {
      throw new Error("No essentiality data found for the provided Ensembl ID.")
    }

    return NextResponse.json({ essentialityData })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred while fetching data." },
      { status: 500 },
    )
  }
}

