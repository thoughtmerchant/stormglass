"use client"

import { useState, useEffect } from "react"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TideChart from "@/components/tide-chart"
import { TideDisplay } from "@/components/tide-display"
import { TideSchedule } from "@/components/tide-schedule"
import LocationSearchForm from "@/components/location-search-form"
import { fetchMarineData } from "@/lib/marine-data-service"
import type { TideData } from "@/lib/noaa-tide-service"
import type { StormglassTideResponse } from "@/lib/stormglass-service"

export default function TideForecastPage() {
  const [location, setLocation] = useState("Santa Monica Bay")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [stormglassTideData, setStormglassTideData] = useState<StormglassTideResponse | null>(null)
  const [noaaTideData, setNoaaTideData] = useState<TideData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chart")

  // Load tide data on initial render
  useEffect(() => {
    async function loadTideData() {
      try {
        setIsLoading(true)
        const marineData = await fetchMarineData()
        
        // Create mock Stormglass tide data
        const mockStormglassTideData: StormglassTideResponse = {
          data: [
            { time: "2025-04-11T00:00:00Z", height: 0.5, type: "low" },
            { time: "2025-04-11T06:00:00Z", height: 1.7, type: "high" },
            { time: "2025-04-11T12:00:00Z", height: 0.3, type: "low" },
            { time: "2025-04-11T18:00:00Z", height: 1.9, type: "high" },
          ],
          meta: {
            dailyQuota: 10,
            requestCount: 1,
            lat: 34.0195,
            lng: -118.5019,
            station: {
              distance: 5.2,
              lat: 34.0295,
              lng: -118.5119,
              name: location,
              source: "Demo Data",
            }
          }
        }
        
        // Create mock NOAA tide data for the TideDisplay and TideSchedule components
        const mockNoaaTideData: TideData = {
          extremes: [
            { t: "2025-04-11T00:00:00Z", v: 0.5, type: "low" },
            { t: "2025-04-11T06:00:00Z", v: 1.7, type: "high" },
            { t: "2025-04-11T12:00:00Z", v: 0.3, type: "low" },
            { t: "2025-04-11T18:00:00Z", v: 1.9, type: "high" },
          ],
          heights: [
            { t: "2025-04-11T00:00:00Z", v: 0.5, type: "low" },
            { t: "2025-04-11T03:00:00Z", v: 1.0 },
            { t: "2025-04-11T06:00:00Z", v: 1.7, type: "high" },
            { t: "2025-04-11T09:00:00Z", v: 1.0 },
            { t: "2025-04-11T12:00:00Z", v: 0.3, type: "low" },
            { t: "2025-04-11T15:00:00Z", v: 1.0 },
            { t: "2025-04-11T18:00:00Z", v: 1.9, type: "high" },
            { t: "2025-04-11T21:00:00Z", v: 1.2 }
          ],
          current: {
            height: 1.2,
            trend: "rising",
            nextExtreme: { t: "2025-04-11T18:00:00Z", v: 1.9, type: "high" }
          }
        }
        
        setStormglassTideData(mockStormglassTideData)
        setNoaaTideData(mockNoaaTideData)
      } catch (error) {
        console.error("Error loading tide data:", error)
        setStormglassTideData(null)
        setNoaaTideData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadTideData()
  }, [location])

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate)
  }

  return (
    <SiteLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Tide Forecast</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Get accurate tide predictions for coastal locations worldwide. View high and low tide times,
          tide heights, and visualizations of tide patterns.
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
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
          <TabsTrigger value="current">Current Tide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading tide data...</p>
                </div>
              </CardContent>
            </Card>
          ) : stormglassTideData ? (
            <TideChart tideData={stormglassTideData} date={date} />
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No tide data available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading tide schedule...</p>
                </div>
              </CardContent>
            </Card>
          ) : noaaTideData ? (
            <TideSchedule tideData={noaaTideData} />
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No tide schedule available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="current" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading current tide data...</p>
                </div>
              </CardContent>
            </Card>
          ) : noaaTideData ? (
            <TideDisplay tideData={noaaTideData} />
          ) : (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <p className="text-gray-500 dark:text-gray-400">No current tide data available for this location</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>About Tide Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Tide forecasts are calculated using harmonic analysis of astronomical factors including:
            </p>
            <ul>
              <li>The Moon's gravitational pull (primary influence)</li>
              <li>The Sun's gravitational pull</li>
              <li>Earth's rotation</li>
              <li>Local bathymetry and coastal geography</li>
            </ul>
            <p>
              Our tide predictions are based on data from NOAA and other international tide stations,
              providing accurate forecasts for thousands of locations worldwide. While tides are generally
              highly predictable, actual tide heights can be affected by weather conditions such as
              atmospheric pressure and wind.
            </p>
            <p>
              For more information on tide prediction accuracy, read our <a href="/output/tide-prediction-accuracy" className="text-blue-600 dark:text-blue-400 hover:underline">
                research article on tide prediction accuracy
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </SiteLayout>
  )
}
