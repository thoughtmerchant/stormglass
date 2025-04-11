"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { OceanDataVisualization } from "@/components/ocean-data-visualization"
import { fetchLocationData } from "@/lib/location-data-service"

// Define the locations we want to display
const LOCATIONS = [
  { name: "North Shore, Hawaii", lat: 21.6642, lng: -158.0531 },
  { name: "Gold Coast, Australia", lat: -28.0023, lng: 153.4312 },
  { name: "Nazaré, Portugal", lat: 39.6079, lng: -9.0756 },
  { name: "Bali, Indonesia", lat: -8.3405, lng: 115.092 },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
  { name: "Malibu, California", lat: 34.0259, lng: -118.7798 },
  { name: "Cornwall, UK", lat: 50.266, lng: -5.0527 },
  { name: "Hossegor, France", lat: 43.6618, lng: -1.4412 },
  { name: "Jeffreys Bay, South Africa", lat: -34.0507, lng: 24.9281 },
  { name: "Santa Monica, California", lat: 34.0095, lng: -118.5005 },
]

export default function ComparePage() {
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [locationData, setLocationData] = useState<any[]>([])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data for all locations when the date changes
  useEffect(() => {
    loadAllLocationData()
  }, [date])

  const loadAllLocationData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch data for all locations in parallel
      const promises = LOCATIONS.map((location) => fetchLocationData(location.lat, location.lng, date))

      const results = await Promise.all(promises)

      // Combine location info with the fetched data
      const combinedData = LOCATIONS.map((location, index) => ({
        ...location,
        data: results[index],
      }))

      setLocationData(combinedData)

      // Check if we have any data at all
      const hasAnyData = results.some(
        (result) => result && (result.tideData || result.waveData || result.waterTempData),
      )

      if (!hasAnyData) {
        setError("Unable to fetch real-time data for any location. API rate limits may have been reached.")
      }
    } catch (error) {
      console.error("Error loading location data:", error)
      setError("An error occurred while fetching data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadAllLocationData()
  }

  // Format local time for a location
  const formatLocalTime = (location: any) => {
    if (!location.data || !location.data.timeZoneOffset) return "Unknown"

    // Calculate the local time based on UTC and the time zone offset
    const now = new Date()
    const utcHours = now.getUTCHours()
    const utcMinutes = now.getUTCMinutes()

    // Apply the time zone offset
    let localHours = (utcHours + location.data.timeZoneOffset) % 24
    if (localHours < 0) localHours += 24

    return `${localHours.toString().padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ocean Data Comparison</h1>
          <p className="text-slate-600">Compare real-time ocean data across different locations around the world</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate)
                    setIsDatePickerOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 border border-amber-200 bg-amber-50 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-amber-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {locationData.map((location, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex justify-between items-center">
                  <span>{location.name}</span>
                  <div className="flex items-center gap-2 text-sm font-normal text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>Local Time: {formatLocalTime(location)}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {location.data ? (
                  <OceanDataVisualization
                    tideData={location.data.tideData}
                    waveData={location.data.waveData}
                    waterTempData={location.data.waterTempData}
                    astronomicalTimes={location.data.astronomicalTimes}
                    timeZoneOffset={location.data.timeZoneOffset}
                    forceDebug={true} // Always enable debug mode on compare page
                  />
                ) : (
                  <div className="h-[400px] flex items-center justify-center flex-col gap-3">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p className="text-slate-500 text-center">
                      No data available for this location.
                      <br />
                      API rate limits may have been reached.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
