"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, MapPin, Calendar, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  fetchStormglassData,
  fetchStormglassTideData,
  generateMockStormglassData,
  generateMockTideData,
  calculateAstronomyData,
  WEATHER_PARAMS,
  MARINE_PARAMS,
  type StormglassResponse,
  type StormglassTideResponse,
} from "@/lib/stormglass-service"
import { adaptTideData, adaptWaveData, adaptWaterTempData } from "@/lib/data-adapters"
import WaveForecastCard from "@/components/wave-forecast-card"
import WeatherCard from "@/components/weather-card"
import TideChart from "@/components/tide-chart"
import AstronomyCard from "@/components/astronomy-card"
import { OceanDataVisualization } from "@/components/ocean-data-visualization"

export default function ForecastPage() {
  const searchParams = useSearchParams()

  // Get parameters from URL
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lng = Number.parseFloat(searchParams.get("lng") || "0")
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const locationName = searchParams.get("name") || "Unknown Location"

  // State for data
  const [forecastData, setForecastData] = useState<StormglassResponse | null>(null)
  const [tideData, setTideData] = useState<StormglassTideResponse | null>(null)
  const [astronomyData, setAstronomyData] = useState<any>(null)
  const [adaptedTideData, setAdaptedTideData] = useState<any>(null)
  const [adaptedWaveData, setAdaptedWaveData] = useState<any>(null)
  const [adaptedWaterTempData, setAdaptedWaterTempData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("marine")
  const [useMockData, setUseMockData] = useState(false)

  // Load data on component mount
  useEffect(() => {
    if (lat && lng && date) {
      loadForecastData()
    } else {
      setError("Missing required parameters")
      setIsLoading(false)
    }
  }, [lat, lng, date])

  // Function to load forecast data
  const loadForecastData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Parse the date
      const selectedDate = new Date(date)

      // Set start time to beginning of the selected date
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)

      // Set end time to end of the selected date
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      // Calculate astronomy data (this doesn't depend on the API)
      const astronomy = calculateAstronomyData(lat, lng, selectedDate)
      setAstronomyData(astronomy)

      if (useMockData) {
        // Use mock data for testing
        console.log("Using mock data for testing")
        const mockForecastData = generateMockStormglassData(lat, lng, startDate, endDate)
        const mockTideData = generateMockTideData(lat, lng, startDate, endDate)

        setForecastData(mockForecastData)
        setTideData(mockTideData)

        // Adapt the mock data for the visualization
        setAdaptedTideData(adaptTideData(mockTideData))
        setAdaptedWaveData(adaptWaveData(mockForecastData))
        setAdaptedWaterTempData(adaptWaterTempData(mockForecastData))

        setIsLoading(false)
        return
      }

      // Fetch weather and marine data - no longer including astronomy params
      const params = [...WEATHER_PARAMS, ...MARINE_PARAMS]
      const weatherResponse = await fetchStormglassData(lat, lng, startDate, endDate, params)

      if ("status" in weatherResponse && weatherResponse.status !== 200) {
        console.error("Weather data error:", weatherResponse.message)

        // If API fails, use mock data instead of throwing an error
        console.log("API request failed, falling back to mock data")
        const mockForecastData = generateMockStormglassData(lat, lng, startDate, endDate)
        const mockTideData = generateMockTideData(lat, lng, startDate, endDate)

        setForecastData(mockForecastData)
        setTideData(mockTideData)

        // Adapt the mock data for the visualization
        setAdaptedTideData(adaptTideData(mockTideData))
        setAdaptedWaveData(adaptWaveData(mockForecastData))
        setAdaptedWaterTempData(adaptWaterTempData(mockForecastData))

        setUseMockData(true)

        // Show a toast notification about using mock data
        toast({
          title: "Using demo data",
          description: "Could not connect to Stormglass API. Showing demo data instead.",
          variant: "warning",
        })
      } else {
        // Use real data from API
        setForecastData(weatherResponse as StormglassResponse)

        // Adapt the weather data for visualization
        setAdaptedWaveData(adaptWaveData(weatherResponse as StormglassResponse))
        setAdaptedWaterTempData(adaptWaterTempData(weatherResponse as StormglassResponse))

        // Fetch tide data
        const tideResponse = await fetchStormglassTideData(lat, lng, startDate, endDate)

        if ("status" in tideResponse && tideResponse.status !== 200) {
          console.error("Tide data error:", tideResponse.message)
          // Use mock tide data if the real API fails
          const mockTideData = generateMockTideData(lat, lng, startDate, endDate)
          setTideData(mockTideData)
          setAdaptedTideData(adaptTideData(mockTideData))
        } else {
          setTideData(tideResponse as StormglassTideResponse)
          setAdaptedTideData(adaptTideData(tideResponse as StormglassTideResponse))
        }
      }
    } catch (err) {
      console.error("Error loading forecast data:", err)

      // Fall back to mock data on any error
      const selectedDate = new Date(date)
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      const mockForecastData = generateMockStormglassData(lat, lng, startDate, endDate)
      const mockTideData = generateMockTideData(lat, lng, startDate, endDate)

      setForecastData(mockForecastData)
      setTideData(mockTideData)

      // Adapt the mock data for the visualization
      setAdaptedTideData(adaptTideData(mockTideData))
      setAdaptedWaveData(adaptWaveData(mockForecastData))
      setAdaptedWaterTempData(adaptWaterTempData(mockForecastData))

      setUseMockData(true)

      toast({
        title: "Using demo data",
        description: "An error occurred. Showing demo data instead.",
        variant: "warning",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get data for a specific hour
  const getHourData = (hour: number) => {
    if (!forecastData || !forecastData.hours || forecastData.hours.length === 0) {
      return null
    }

    const selectedDate = new Date(date)
    selectedDate.setHours(hour, 0, 0, 0)

    // Find the closest hour in the data
    let closestHour = forecastData.hours[0]
    let minDiff = Number.POSITIVE_INFINITY

    for (const hourData of forecastData.hours) {
      const hourTime = new Date(hourData.time)
      const diff = Math.abs(hourTime.getTime() - selectedDate.getTime())

      if (diff < minDiff) {
        minDiff = diff
        closestHour = hourData
      }
    }

    return closestHour
  }

  // Get data for specific hours of the day
  const getHourlyData = () => {
    // Instead of using a fixed array of hours [6, 9, 12, 15, 18]
    // Generate all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours
      .map((hour) => ({
        hour,
        data: getHourData(hour),
      }))
      .filter((item) => item.data !== null)
  }

  // Helper function to convert meters to feet
  const metersToFeet = (meters: number) => meters * 3.28084

  // Handle refresh button click
  const handleRefresh = () => {
    // Reset mock data flag to try real API again
    setUseMockData(false)
    loadForecastData()
  }

  // Toggle between real and mock data
  const toggleMockData = () => {
    setUseMockData(!useMockData)
    loadForecastData()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Loading Forecast Data</h2>
              <p className="text-muted-foreground">Fetching data from Stormglass.io...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hourlyData = getHourlyData()

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              {locationName}
            </h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2" />
              {formattedDate}
            </p>
          </div>

          <Button onClick={handleRefresh} variant="outline" className="shrink-0">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {useMockData && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-amber-800 font-medium">Using Demo Data</p>
                <p className="text-sm text-amber-700">
                  Could not connect to Stormglass API. Showing demonstration data instead.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ocean Data Visualization */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ocean Conditions Visualization</CardTitle>
            <CardDescription>Visual representation of tide, wave, and astronomical data</CardDescription>
          </CardHeader>
          <CardContent>
            <OceanDataVisualization
              tideData={adaptedTideData}
              waveData={adaptedWaveData}
              waterTempData={adaptedWaterTempData}
              astronomicalTimes={{
                firstLight:
                  new Date(astronomyData?.sunrise || "").getHours() > 0
                    ? `${(new Date(astronomyData?.sunrise || "").getHours() - 1).toString().padStart(2, "0")}:${new Date(astronomyData?.sunrise || "").getMinutes().toString().padStart(2, "0")}`
                    : "05:30",
                sunrise: `${new Date(astronomyData?.sunrise || "").getHours().toString().padStart(2, "0")}:${new Date(astronomyData?.sunrise || "").getMinutes().toString().padStart(2, "0")}`,
                sunset: `${new Date(astronomyData?.sunset || "").getHours().toString().padStart(2, "0")}:${new Date(astronomyData?.sunset || "").getMinutes().toString().padStart(2, "0")}`,
                lastLight:
                  new Date(astronomyData?.sunset || "").getHours() < 23
                    ? `${(new Date(astronomyData?.sunset || "").getHours() + 1).toString().padStart(2, "0")}:${new Date(astronomyData?.sunset || "").getMinutes().toString().padStart(2, "0")}`
                    : "20:30",
              }}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="marine" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="marine">Marine</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="tide">Tide</TabsTrigger>
            <TabsTrigger value="astronomy">Astronomy</TabsTrigger>
          </TabsList>

          <TabsContent value="marine" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Marine Forecast</CardTitle>
                <CardDescription>Wave and swell conditions throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                {hourlyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 min-w-[800px]">
                      {hourlyData.map(({ hour, data }) => (
                        <WaveForecastCard
                          key={hour}
                          time={data.time}
                          waveHeight={data.waveHeight?.["sg"]}
                          waveDirection={data.waveDirection?.["sg"]}
                          wavePeriod={data.wavePeriod?.["sg"]}
                          swellHeight={data.swellHeight?.["sg"]}
                          swellDirection={data.swellDirection?.["sg"]}
                          swellPeriod={data.swellPeriod?.["sg"]}
                          waterTemperature={data.waterTemperature?.["sg"]}
                          windSpeed={data.windSpeed?.["sg"]}
                          windDirection={data.windDirection?.["sg"]}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    No marine forecast data available for this date
                  </p>
                )}
              </CardContent>
            </Card>

            {forecastData && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {useMockData
                      ? "Using demonstration data"
                      : `Quota: ${forecastData.meta.dailyQuota} | Requests: ${forecastData.meta.requestCount}`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Also update the weather tab to show all hours */}
          <TabsContent value="weather" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>Temperature, precipitation, and wind conditions</CardDescription>
              </CardHeader>
              <CardContent>
                {hourlyData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 min-w-[800px]">
                      {hourlyData.map(({ hour, data }) => (
                        <WeatherCard
                          key={hour}
                          time={data.time}
                          airTemperature={data.airTemperature?.["sg"]}
                          humidity={data.humidity?.["sg"]}
                          cloudCover={data.cloudCover?.["sg"]}
                          precipitation={data.precipitation?.["sg"]}
                          windSpeed={data.windSpeed?.["sg"]}
                          windDirection={data.windDirection?.["sg"]}
                          visibility={data.visibility?.["sg"]}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    No weather forecast data available for this date
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tide" className="space-y-6">
            {tideData ? (
              <TideChart tideData={tideData} date={date} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Tide Information</CardTitle>
                </CardHeader>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No tide data available for this location and date</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="astronomy" className="space-y-6">
            {astronomyData ? (
              <AstronomyCard
                sunrise={astronomyData.sunrise}
                sunset={astronomyData.sunset}
                moonrise={astronomyData.moonrise}
                moonset={astronomyData.moonset}
                moonPhase={astronomyData.moonPhase}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Astronomy Information</CardTitle>
                </CardHeader>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No astronomy data available for this date</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Developer tools - toggle between real and mock data */}
        <div className="mt-8 pt-4 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={toggleMockData}>
            {useMockData ? "Try Real API" : "Use Demo Data"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Developer tool: Toggle between real API data and demonstration data
          </p>
        </div>
      </div>
    </div>
  )
}
