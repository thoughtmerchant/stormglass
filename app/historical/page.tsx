"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, isValid } from "date-fns"
import { RefreshCw, AlertTriangle, Info, CalendarIcon } from "lucide-react"
import { OceanDataVisualization } from "@/components/ocean-data-visualization"
import { fetchHistoricalMarineData } from "@/lib/historical-data-service"
import { WaveSummary } from "@/components/wave-summary"
import { WaterTemperatureDisplay } from "@/components/water-temperature-display"
import { DayTimeline } from "@/components/day-timeline"
import { TideComparison } from "@/components/tide-comparison"

const SANTA_MONICA_TIDE_STATION = "9410840" // Santa Monica Pier tide station

export default function HistoricalPage() {
  // Set initial date to yesterday
  const [date, setDate] = useState<Date>(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  })

  // State for dropdown values
  const [month, setMonth] = useState<number>(date.getMonth())
  const [day, setDay] = useState<number>(date.getDate())
  const [year, setYear] = useState<number>(date.getFullYear())

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marineData, setMarineData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dataSource, setDataSource] = useState<string>("")

  // Update dropdown values when date changes
  useEffect(() => {
    setMonth(date.getMonth())
    setDay(date.getDate())
    setYear(date.getFullYear())
  }, [date])

  // Load historical data when date changes
  useEffect(() => {
    loadHistoricalData(date)
  }, [date])

  // Update date when dropdown values change
  useEffect(() => {
    const newDate = new Date(year, month, day)
    if (isValid(newDate) && newDate.getTime() !== date.getTime()) {
      setDate(newDate)
    }
  }, [month, day, year])

  async function loadHistoricalData(selectedDate: Date) {
    try {
      setIsLoading(true)
      setErrors({})
      setDataSource("")
      console.log(`Fetching historical data for ${selectedDate.toDateString()}...`)

      // Fetch historical marine data
      const data = await fetchHistoricalMarineData(selectedDate)
      setMarineData(data)

      // Check for specific errors in the response
      const newErrors: Record<string, string> = {}
      if (data.tideError) newErrors.tide = data.tideError
      if (data.waveError) newErrors.wave = data.waveError
      if (data.waterTempError) newErrors.waterTemp = data.waterTempError

      setErrors(newErrors)

      // Determine data source for display
      let sourceText = "NOAA CO-OPS API"
      if (data.tideData) {
        sourceText += ", Tide Predictions"
      }
      if (data.waveData?.source) {
        sourceText += `, ${data.waveData.source}`
      }
      if (data.waterTempData?.source) {
        sourceText += `, ${data.waterTempData.source}`
      }
      setDataSource(sourceText)
    } catch (error) {
      console.error("Error loading historical data:", error)
      setErrors({
        general: error instanceof Error ? error.message : "Failed to load historical data. Please try another date.",
      })
      setMarineData(null)
      setDataSource("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadHistoricalData(date).then(() => {
      setIsRefreshing(false)
    })
  }

  // Calculate the earliest date (5 years ago from today)
  const today = new Date()
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  // Generate arrays for dropdown options
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get days in the selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Generate years (from 5 years ago to current year)
  const years = []
  for (let y = today.getFullYear(); y >= fiveYearsAgo.getFullYear(); y--) {
    years.push(y)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-slate-800 mb-4">Historical Ocean Data</h1>
        <div className="flex justify-between items-center">
          <p className="text-slate-600">View historical ocean conditions for Venice Pier, California.</p>
          <div className="flex flex-col gap-1 items-end">
            <div className="text-sm font-medium text-slate-700 self-start">Select Date:</div>

            {/* Date selection with dropdowns */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />

                  {/* Month dropdown */}
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                    aria-label="Month"
                  >
                    {monthNames.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* Day dropdown */}
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm w-16"
                    aria-label="Day"
                  >
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  {/* Year dropdown */}
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm w-20"
                    aria-label="Year"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 w-8"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data source notice */}
      {dataSource && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Data Source:</span> {dataSource}
                </p>
                <p className="text-xs mt-1">Showing data for {format(date, "MMMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display errors if any */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 space-y-3">
          {errors.general && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>{errors.general}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {errors.tide && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>Tide data: {errors.tide}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {errors.wave && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>Wave data: {errors.wave}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {errors.waterTemp && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>Water temperature data: {errors.waterTemp}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !marineData ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600 text-center">No data available for the selected date.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Only show visualization if we have tide data */}
          {marineData.tideData && (
            <Card>
              <CardHeader>
                <CardTitle>Ocean Conditions for {format(date, "MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <OceanDataVisualization
                  tideData={marineData.tideData}
                  waveData={marineData.waveData}
                  waterTempData={marineData.waterTempData}
                  astronomicalTimes={marineData.astronomicalTimes}
                />
              </CardContent>
            </Card>
          )}

          {/* Add Tide Comparison component if we have both predicted and actual data */}
          {marineData.waterLevelData && marineData.tideData && (
            <TideComparison predictedData={marineData.tideData} actualData={marineData.waterLevelData} date={date} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {marineData.waveData && <WaveSummary waveData={marineData.waveData} />}
              {marineData.waterTempData && <WaterTemperatureDisplay waterTempData={marineData.waterTempData} />}
            </div>
            <div>
              <DayTimeline astronomicalTimes={marineData.astronomicalTimes} />
            </div>
          </div>

          {marineData.tideData && (
            <Card>
              <CardHeader>
                <CardTitle>Tide Information</CardTitle>
              </CardHeader>
              <CardContent>
                {marineData.tideData?.extremes && marineData.tideData.extremes.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Tide Extremes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marineData.tideData.extremes.map((extreme: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${extreme.type === "high" ? "bg-blue-100" : "bg-orange-100"}`}
                            >
                              {extreme.type === "high" ? (
                                <svg
                                  className="h-4 w-4 text-blue-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              ) : (
                                <svg
                                  className="h-4 w-4 text-orange-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{extreme.type === "high" ? "High Tide" : "Low Tide"}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(extreme.t).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${extreme.type === "high" ? "text-blue-600" : "text-orange-600"}`}
                            >
                              {extreme.v.toFixed(2)}ft
                            </p>
                            <p className="text-xs text-slate-500">{(extreme.v * 0.3048).toFixed(2)}m</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center">No tide data available for this date.</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-slate-500 text-center">
            <p>
              Data sources: NOAA CO-OPS API, Station {marineData.waterTempData?.station || SANTA_MONICA_TIDE_STATION}
            </p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
