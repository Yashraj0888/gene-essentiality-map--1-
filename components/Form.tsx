// components/GeneSearchForm.tsx
"use client"

import { use, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ReactiveButton from 'reactive-button';

interface GeneSearchFormProps {
  setEnsemblId: (id: string) => void;
  loading: boolean;
  error: string;
}

export const GeneSearchForm = ({ setEnsemblId, loading, error }: GeneSearchFormProps) => {
  const [inputValue, setInputValue] = useState("ENSG00000139618")
  const [isDark, setIsDark] = useState(false)

  const handleSearch = () => {
    setEnsemblId(inputValue)
  }
  useEffect(() => {
    handleSearch()
  }, [setEnsemblId])

 const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
};
 

  return (
    <div className="space-y-4">
      <Card className="border-gray-800 rounded-2xl dark:border-white ml-[0] mr-[0] lg:mr-[20vw] lg:ml-[20vw]">
        <CardHeader className="flex flex-row items-center justify-center pb-2">
          <CardTitle className="sm:text-4xl md:text-4xl font-bold mb-6">
            Gene Essentiality Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex justify-center space-x-4 items-center border-gray-800 rounded-full transition-all duration-500 ${
              loading ? "transform scale-95" : "transform scale-100"
            }`}
          >
            <Input
              placeholder="Enter Ensembl Gene ID"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border-gray-600 rounded-full focus:border-gray-600 focus:ring-gray-600"
            />
            <ReactiveButton
              buttonState={loading ? 'loading' : 'idle'}
              idleText={'Fetch Data'}
              loadingText={'Loading'}
              onClick={handleSearch}
              rounded={true}
              color="dark"
            />
            
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4 text-red-600 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}