"use client"

import { useState, useEffect } from "react"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WaveSummary } from "@/components/wave-summary"
import { TideDisplay } from "@/components/tide-display"
import LocationSearchForm from "@/components/location-search-form"
import { fetchMarineData } from "@/lib/marine-data-service"
import type { WaveData } from "@/lib/wave-service"
import type { TideData } from "@/lib/noaa-tide-service"
import type { StormglassTideResponse } from "@/lib/stormglass-service"

export default function MarineDashboardPage() {
  const [location, setLocation] = useState("Santa Monica Bay")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [waveData, setWaveData] = useState<WaveData | null>(null)
  const [stormglassTideData, setStormglassTideData] = useState<StormglassTideResponse | null>(null)
  const [noaaTideData, setNoaaTideData] = useState<TideData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("current")

  // Load marine data on initial render
  useEffect(() => {
    async function loadMarineData() {
      try {
        setIsLoading(true)
        const marineData = await fetchMarineData()
        setWaveData(marineData.waveData)
        
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
        
        // Create mock NOAA tide data
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
        console.error("Error loading marine data:", error)
        setWaveData(null)
        setStormglassTideData(null)
        setNoaaTideData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarineData()
  }, [location])

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate)
  }

  // Mock weather data (in imperial units)
  const currentWeather = {
    temp: 72, // Fahrenheit
    feelsLike: 73, // Fahrenheit
    condition: "Clear sky",
    humidity: 65, // percentage
    windSpeed: 7, // mph
    windDirection: "NW",
    uvi: 6.2,
  }

  // Mock astronomical data
  const astronomicalTimes = {
    firstLight: "05:42",
    sunrise: "06:12",
    sunset: "19:32",
    lastLight: "20:02",
  }

  // Mock moon data
  const moonData = {
    phase: "Waxing Gibbous",
    illumination: 75, // percentage of moon illuminated
    age: 10, // days since new moon
    nextFullMoon: "April 5, 2025",
  }

  return (
    <SiteLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Marine Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Comprehensive marine information including tide, wave, weather, and astronomical data
          for your location.
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
          <TabsTrigger value="current">Current Conditions</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="astronomy">Astronomy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 animate-pulse">
              <Card>
                <CardContent className="p-8 flex justify-center items-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading current conditions...</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wave Summary */}
              {waveData ? (
                <WaveSummary waveData={waveData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Wave Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex justify-center items-center">
                    <p className="text-gray-500 dark:text-gray-400">No wave data available</p>
                  </CardContent>
                </Card>
              )}

              {/* Current Tide */}
              {noaaTideData ? (
                <TideDisplay tideData={noaaTideData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Tide</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex justify-center items-center">
                    <p className="text-gray-500 dark:text-gray-400">No tide data available</p>
                  </CardContent>
                </Card>
              )}

              {/* Current Weather */}
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-100">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-amber-700">{currentWeather.temp}°F</span>
                      <span className="text-lg text-slate-600">({((currentWeather.temp - 32) * 5/9).toFixed(1)}°C)</span>
                    </div>
                    <div>
                      <p className="text-xl font-medium text-amber-800">{currentWeather.condition}</p>
                      <p className="text-sm text-slate-600">
                        Feels like: {currentWeather.feelsLike}°F | Wind: {currentWeather.windSpeed} mph {currentWeather.windDirection}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Water Temperature */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-blue-700">68°F</span>
                      <span className="text-lg text-slate-600">(20.0°C)</span>
                    </div>
                    <div className="text-xl font-medium text-blue-800">
                      Water Temperature
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading forecast data...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Wave Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>Wave Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  {waveData && waveData.forecast && waveData.forecast.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {waveData.forecast.slice(0, 4).map((forecast, index) => (
                        <Card key={index} className="h-full">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                              {new Date(forecast.time * 1000).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs">Height</div>
                              <div className="text-sm font-bold">{forecast.height.toFixed(1)}ft</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs">Period</div>
                              <div className="text-sm">{forecast.period}s</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs">Direction</div>
                              <div className="text-sm">{forecast.directionText}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No wave forecast available</p>
                  )}
                </CardContent>
              </Card>

              {/* Weather Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>Weather Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Mock weather forecast data */}
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Card key={index} className="h-full">
                        <CardContent className="p-4">
                          <div className="text-sm font-medium mb-2">
                            {new Date(Date.now() + index * 3600000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs">Temp</div>
                            <div className="text-sm font-bold">{Math.round(currentWeather.temp - index)}°F</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs">Condition</div>
                            <div className="text-sm">{currentWeather.condition}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="astronomy" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sun Times */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
              <CardHeader>
                <CardTitle>Astronomy Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Sun</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Sunrise:</span>
                        <span className="text-sm">{astronomicalTimes.sunrise}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Sunset:</span>
                        <span className="text-sm">{astronomicalTimes.sunset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">First Light:</span>
                        <span className="text-sm">{astronomicalTimes.firstLight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Last Light:</span>
                        <span className="text-sm">{astronomicalTimes.lastLight}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Moon</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Phase:</span>
                        <span className="text-sm">{moonData.phase}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Illumination:</span>
                        <span className="text-sm">{moonData.illumination}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Next Full:</span>
                        <span className="text-sm">{moonData.nextFullMoon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tide Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tide Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {noaaTideData ? (
                  <div className="space-y-3">
                    {noaaTideData.extremes.slice(0, 4).map((tide, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${tide.type === "high" ? "bg-blue-100" : "bg-orange-100"}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={tide.type === "high" ? "#3b82f6" : "#f97316"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {tide.type === "high" ? (
                                <path d="M12 19V5M5 12l7-7 7 7" />
                              ) : (
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">{tide.type === "high" ? "High Tide" : "Low Tide"}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(tide.t).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${tide.type === "high" ? "text-blue-600" : "text-orange-600"}`}>
                            {tide.v.toFixed(1)}ft
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No tide schedule available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>About Marine Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              The Marine Dashboard provides a comprehensive view of ocean and coastal conditions, combining multiple data sources:
            </p>
            <ul>
              <li><strong>Wave Data</strong> - Height, period, and direction information from NOAA Wave Watch III and Stormglass</li>
              <li><strong>Tide Information</strong> - Current tide state, upcoming extremes, and daily tide schedule from NOAA tide stations</li>
              <li><strong>Weather Conditions</strong> - Current and forecast weather specifically optimized for coastal areas</li>
              <li><strong>Astronomical Data</strong> - Sun and moon information affecting tides and ocean conditions</li>
            </ul>
            <p>
              This integrated view helps surfers, sailors, and coastal enthusiasts make informed decisions 
              based on complete marine information rather than isolated data points.
            </p>
            <p>
              For more detailed analysis, visit our dedicated <a href="/ocean-data/tide-forecast" className="text-blue-600 dark:text-blue-400 hover:underline">Tide Forecast</a> and 
              <a href="/ocean-data/wave-analysis" className="text-blue-600 dark:text-blue-400 hover:underline"> Wave Analysis</a> pages.
            </p>
          </div>
        </CardContent>
      </Card>
    </SiteLayout>
  )
}
