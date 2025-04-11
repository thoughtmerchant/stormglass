"use client"

import { useState, useEffect } from "react"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WaveForecastCard from "@/components/wave-forecast-card"
import { WaveSummary } from "@/components/wave-summary"
import { SwellDirectionVisualization } from "@/components/swell-direction-visualization"
import LocationSearchForm from "@/components/location-search-form"
import { fetchMarineData } from "@/lib/marine-data-service"
import type { WaveData } from "@/lib/wave-service"

export default function WaveAnalysisPage() {
  const [location, setLocation] = useState("Santa Monica Bay")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [waveData, setWaveData] = useState<WaveData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")

  // Load wave data on initial render
  useEffect(() => {
    async function loadWaveData() {
      try {
        setIsLoading(true)
        const marineData = await fetchMarineData()
        setWaveData(marineData.waveData)
      } catch (error) {
        console.error("Error loading wave data:", error)
        setWaveData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadWaveData()
  }, [])

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate)
  }

  return (
    <SiteLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Wave Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Detailed analysis of wave conditions including height, period, direction, and swell 
          characteristics to help understand ocean conditions.
        </p>
      </div>

      <Card className="mb-8 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Search for a Location</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSearchForm />
          <div className="mt-4 text-sm text-gray-500">
            Note: Currently using {location} as the default location for demonstration purposes.
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{location}</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="direction">Swell Direction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading wave data...</p>
                </div>
              </CardContent>
            </Card>
          ) : waveData ? (
            <WaveSummary waveData={waveData} />
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No wave data available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading wave forecast...</p>
                </div>
              </CardContent>
            </Card>
          ) : waveData && waveData.forecast && waveData.forecast.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {waveData.forecast.slice(0, 9).map((forecast, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {new Date(forecast.time * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Wave Height</div>
                      <div className="text-xl font-bold text-cyan-700">{forecast.height.toFixed(1)}ft</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Period</div>
                      <div className="text-lg font-medium">{forecast.period}s</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Direction</div>
                      <div className="text-lg font-medium">{forecast.directionText} ({forecast.direction}°)</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No wave forecast available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="direction" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading swell direction data...</p>
                </div>
              </CardContent>
            </Card>
          ) : waveData ? (
            <Card>
              <CardHeader>
                <CardTitle>Swell Direction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  <SwellDirectionVisualization waveData={waveData} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No swell direction data available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>About Wave Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Wave analysis provides critical information for surfers, sailors, and coastal managers. 
              Understanding wave conditions involves several key measurements:
            </p>
            <ul>
              <li><strong>Wave Height</strong> - Measured from trough to crest, indicates the overall size of waves</li>
              <li><strong>Wave Period</strong> - Time between wave crests, longer periods typically indicate more powerful waves</li>
              <li><strong>Wave Direction</strong> - The direction from which waves are coming, important for understanding how waves will break</li>
              <li><strong>Swell Components</strong> - Multiple swell systems can interact, creating complex wave patterns</li>
            </ul>
            <p>
              Our wave analysis combines data from multiple sources including NOAA Wave Watch III, 
              Stormglass, and CDIP buoys to provide comprehensive information about ocean conditions.
            </p>
            <p>
              For more information on interpreting wave patterns, read our <a href="/output/understanding-wave-patterns" className="text-blue-600 dark:text-blue-400 hover:underline">
                research article on understanding wave patterns
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </SiteLayout>
  )
}
