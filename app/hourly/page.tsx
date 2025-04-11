"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Sun, Sunrise, Sunset, Moon } from "lucide-react"
import { SwellDirectionVisualization } from "@/components/swell-direction-visualization"
import { WaveSummary } from "@/components/wave-summary"
import { DayTimeline } from "@/components/day-timeline"
import { WaterTemperatureDisplay } from "@/components/water-temperature-display"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"
import { fetchMarineData } from "@/app/actions"
import { OceanDataVisualization } from "@/components/ocean-data-visualization"

export default function HourlyPage() {
  const [waveData, setWaveData] = useState<any>(null)
  const [waterTempData, setWaterTempData] = useState<WaterTemperatureData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock astronomical data - in a real app, this would come from an API or service
  const astronomicalTimes = {
    firstLight: "05:42",
    sunrise: "06:12",
    sunset: "19:32",
    lastLight: "20:02",
  }

  // Load wave data on component mount
  useEffect(() => {
    loadWaveData()
  }, [])

  async function loadWaveData() {
    try {
      setIsLoading(true)
      console.log("Fetching marine data...")

      // Use the server action to fetch all marine data
      const marineData = await fetchMarineData()

      console.log("Marine data received:", marineData)
      setWaveData(marineData.waveData)
      setWaterTempData(marineData.waterTempData)
    } catch (error) {
      console.error("Error loading marine data:", error)
      setWaveData(null)
      setWaterTempData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadWaveData()
    setIsRefreshing(false)
  }

  // Process hourly data
  const getHourlyData = () => {
    if (!waveData || !waveData.hourlyForecast) return []

    // Create array for all 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      // Get data for this hour if available
      const hourData = waveData.hourlyForecast[hour]

      return {
        hour,
        time: `${hour.toString().padStart(2, "0")}:00`,
        height: hourData ? hourData.height : null,
        direction: hourData ? hourData.direction : null,
        directionText: hourData ? hourData.directionText : null,
        period: hourData ? hourData.period : null,
      }
    })

    return hourlyData
  }

  // Helper function to convert feet to meters
  const feetToMeters = (feet: number): string => {
    if (feet === null || isNaN(feet)) return "-"
    return (feet * 0.3048).toFixed(1)
  }

  // Helper function to convert time string (HH:MM) to hour number
  const timeToHour = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours + minutes / 60
  }

  // Helper function to check if a sun event occurs within an hour
  const getSunEventInHour = (hour: number) => {
    const events = [
      { name: "First Light", time: astronomicalTimes.firstLight, icon: <Sun className="h-4 w-4 text-amber-500" /> },
      { name: "Sunrise", time: astronomicalTimes.sunrise, icon: <Sunrise className="h-4 w-4 text-orange-500" /> },
      {
        name: "Sunset",
        time: astronomicalTimes.sunset,
        icon: <Sunset className="h-5 w-5 text-blue-600" />,
        className: "bg-white shadow-sm rounded px-1 py-0.5 border border-blue-200",
      },
      { name: "Last Light", time: astronomicalTimes.lastLight, icon: <Moon className="h-4 w-4 text-indigo-500" /> },
    ]

    for (const event of events) {
      const eventHour = timeToHour(event.time)
      if (eventHour >= hour && eventHour < hour + 1) {
        return {
          ...event,
          // Calculate percentage through the hour (0-100)
          percentage: ((eventHour - hour) * 100).toFixed(0),
        }
      }
    }
    return null
  }

  const hourlyData = getHourlyData()

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-slate-800 mb-4">Hourly Forecast</h1>
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Detailed hourly wave and weather conditions for Santa Monica Bay.</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !waveData ? (
        <div className="text-center py-8 text-slate-500">No wave data available</div>
      ) : (
        <>
          <div className="mb-8">
            <WaveSummary waveData={waveData} />
          </div>

          {/* Add Water Temperature Display */}
          <div className="mb-8">
            <WaterTemperatureDisplay waterTempData={waterTempData} />
          </div>

          {/* Add the DayTimeline component here */}
          <div className="mb-8">
            <DayTimeline astronomicalTimes={astronomicalTimes} />
          </div>

          {/* Add Ocean Data Visualization if needed */}
          {!isLoading && waveData && waterTempData && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-4">
                  <OceanDataVisualization
                    tideData={null}
                    waveData={waveData}
                    waterTempData={waterTempData}
                    astronomicalTimes={astronomicalTimes}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-8">
            <SwellDirectionVisualization waveData={waveData} />
          </div>

          {/* Sun Times Summary Card */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span>Today's Sun Times</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">First Light</span>
                    </div>
                    <div className="text-lg font-bold">{astronomicalTimes.firstLight}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sunrise className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Sunrise</span>
                    </div>
                    <div className="text-lg font-bold">{astronomicalTimes.sunrise}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sunset className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Sunset</span>
                    </div>
                    <div className="text-lg font-bold">{astronomicalTimes.sunset}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">Last Light</span>
                    </div>
                    <div className="text-lg font-bold">{astronomicalTimes.lastLight}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Santa Monica Bay - {new Date().toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-4 py-2 text-left">Hour</th>
                      <th className="border border-slate-300 px-4 py-2 text-left">Wave Height</th>
                      <th className="border border-slate-300 px-4 py-2 text-left">Direction</th>
                      <th className="border border-slate-300 px-4 py-2 text-left">Period (s)</th>
                      <th className="border border-slate-300 px-4 py-2 text-left">Sun Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourlyData.map((hour) => {
                      const sunEvent = getSunEventInHour(hour.hour)

                      return (
                        <tr
                          key={hour.hour}
                          className={`${hour.hour % 2 === 0 ? "bg-slate-50" : ""} ${
                            // Add subtle background color based on day/night
                            hour.hour >= timeToHour(astronomicalTimes.sunrise) &&
                            hour.hour < timeToHour(astronomicalTimes.sunset)
                              ? "bg-opacity-30"
                              : "bg-slate-100 bg-opacity-20"
                          }`}
                        >
                          <td className="border border-slate-300 px-4 py-2 font-medium">{hour.time}</td>
                          <td className="border border-slate-300 px-4 py-2">
                            {hour.height !== null ? (
                              <>
                                <span className="font-medium">{hour.height.toFixed(1)}ft</span>
                                <span className="text-slate-500 text-sm ml-2">({feetToMeters(hour.height)}m)</span>
                              </>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-300 px-4 py-2">
                            {hour.directionText ? (
                              <div className="flex items-center gap-2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-slate-500"
                                  style={{
                                    transform: `rotate(${hour.direction - 180}deg)`,
                                  }}
                                >
                                  <path d="M12 19V5" />
                                  <path d="M5 12l7-7 7 7" />
                                </svg>
                                <span>{hour.directionText}</span>
                                <span className="text-slate-400 text-sm">({hour.direction}°)</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-300 px-4 py-2">
                            {hour.period !== null ? (
                              <span>{hour.period}s</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-300 px-4 py-2 relative">
                            {sunEvent ? (
                              <div
                                className={`flex items-center gap-2 ${sunEvent.className || ""}`}
                                style={{
                                  position: "relative",
                                  left: `${sunEvent.percentage}%`,
                                  transform: "translateX(-50%)",
                                  zIndex: sunEvent.name === "Sunset" ? 10 : 1,
                                }}
                              >
                                {sunEvent.icon}
                                <span
                                  className={`text-sm ${sunEvent.name === "Sunset" ? "font-bold text-black" : "font-medium"}`}
                                >
                                  {sunEvent.name}
                                </span>
                                <span
                                  className={`text-xs ${sunEvent.name === "Sunset" ? "text-black" : "text-slate-500"}`}
                                >
                                  {sunEvent.time}
                                </span>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                <p>Data source: {waveData.source}</p>
                <p>Last updated: {new Date().toLocaleString()}</p>
                <p className="italic mt-2">Note: Empty cells indicate no data available for that hour</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
