"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Waves } from "lucide-react"
import { useState, useEffect } from "react"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"
import { fetchMarineData } from "@/lib/marine-data-service"
import LocationSearchForm from "@/components/location-search-form"

// Sample client data
const clients = [
  { name: "NOAA", description: "Weather and ocean data provider" },
  { name: "California Coastal Commission", description: "Coastal management and protection" },
  { name: "Santa Monica Pier Aquarium", description: "Marine education and conservation" },
  { name: "Heal the Bay", description: "Environmental advocacy organization" },
  { name: "LA County Beaches", description: "Beach management and lifeguard services" },
  { name: "Surfrider Foundation", description: "Ocean conservation nonprofit" },
]

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [waveData, setWaveData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [waterTempData, setWaterTempData] = useState<WaterTemperatureData | null>(null)

  // Load wave data on component mount
  useEffect(() => {
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

    loadWaveData()
  }, [])

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

  const hourlyForecast = [
    { time: "10:00", temp: 70, condition: "Clear" }, // Fahrenheit
    { time: "11:00", temp: 72, condition: "Clear" }, // Fahrenheit
    { time: "12:00", temp: 73, condition: "Clear" }, // Fahrenheit
    { time: "13:00", temp: 75, condition: "Partly cloudy" }, // Fahrenheit
    { time: "14:00", temp: 75, condition: "Partly cloudy" }, // Fahrenheit
    { time: "15:00", temp: 73, condition: "Partly cloudy" }, // Fahrenheit
    { time: "16:00", temp: 72, condition: "Clear" }, // Fahrenheit
    { time: "17:00", temp: 70, condition: "Clear" }, // Fahrenheit
  ]

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

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      console.log("Refreshing marine data...")
      const marineData = await fetchMarineData()
      console.log("New marine data received:", marineData)
      setWaveData(marineData.waveData)
      setWaterTempData(marineData.waterTempData)
    } catch (error) {
      console.error("Error refreshing marine data:", error)
      setWaveData(null)
      setWaterTempData(null)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Helper function to render moon phase SVG
  const renderMoonPhase = (phase: string, illumination: number) => {
    // SVG dimensions
    const size = 120
    const radius = size / 2
    const center = size / 2

    // Different moon phases require different SVG approaches
    switch (phase) {
      case "New Moon":
        // New moon is completely dark
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        )

      case "Full Moon":
        // Full moon is completely illuminated
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={center} cy={center} r={radius} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        )

      case "First Quarter":
        // Right half illuminated
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
            <path
              d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} L ${center} ${center - radius}`}
              fill="#f1f5f9"
            />
          </svg>
        )

      case "Last Quarter":
        // Left half illuminated
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
            <path
              d={`M ${center} ${center - radius} A ${radius} ${radius} 0 0 0 ${center} ${center + radius} L ${center} ${center - radius}`}
              fill="#f1f5f9"
            />
          </svg>
        )

      case "Waxing Crescent":
      case "Waxing Gibbous":
      case "Waning Crescent":
      case "Waning Gibbous":
        // For crescent and gibbous phases, we need to calculate the terminator curve
        const isWaxing = phase.includes("Waxing")
        const isGibbous = phase.includes("Gibbous")

        // Calculate the x-offset of the terminator curve based on illumination
        // For waxing phases, the terminator moves right as illumination increases
        // For waning phases, the terminator moves left as illumination decreases
        let xOffset
        if (isWaxing) {
          // For waxing phases, map illumination from 0-50% for crescent, 50-100% for gibbous
          xOffset = isGibbous
            ? center + (radius * (illumination - 50)) / 50
            : center - (radius * (50 - illumination)) / 50
        } else {
          // For waning phases, map illumination from 100-50% for gibbous, 50-0% for crescent
          xOffset = isGibbous
            ? center - (radius * (100 - illumination)) / 50
            : center + (radius * (50 - illumination)) / 50
        }

        // Calculate control points for the bezier curve
        const controlPoint = isWaxing ? center - radius / 2 : center + radius / 2

        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            {/* Base circle (dark side of moon) */}
            <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />

            {/* Illuminated portion */}
            <clipPath id="moonClip">
              <circle cx={center} cy={center} r={radius} />
            </clipPath>

            <g clipPath="url(#moonClip)">
              {/* For waxing phases, the light comes from the right */}
              {/* For waning phases, the light comes from the left */}
              {isWaxing ? (
                <ellipse cx={xOffset} cy={center} rx={radius * 1.05} ry={radius} fill="#f1f5f9" />
              ) : (
                <ellipse cx={xOffset} cy={center} rx={radius * 1.05} ry={radius} fill="#f1f5f9" />
              )}
            </g>
          </svg>
        )

      default:
        // Default to a full moon if phase is unknown
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={center} cy={center} r={radius} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        )
    }
  }

  // Helper function to render wave direction compass
  const renderWaveDirectionCompass = (direction: number) => {
    // SVG dimensions
    const size = 100
    const radius = size / 2 - 10
    const center = size / 2

    // Calculate the end point of the direction arrow
    const radians = (direction - 90) * (Math.PI / 180) // Convert degrees to radians, adjust for SVG coordinate system
    const arrowLength = radius * 0.8
    const arrowX = center + arrowLength * Math.cos(radians)
    const arrowY = center + arrowLength * Math.sin(radians)

    // Calculate the points for the arrowhead
    const arrowHeadSize = 8
    const arrowHeadAngle = 25 * (Math.PI / 180) // 25 degrees in radians

    const arrowHead1X = arrowX - arrowHeadSize * Math.cos(radians - arrowHeadAngle)
    const arrowHead1Y = arrowY - arrowHeadSize * Math.sin(radians - arrowHeadAngle)

    const arrowHead2X = arrowX - arrowHeadSize * Math.cos(radians + arrowHeadAngle)
    const arrowHead2Y = arrowY - arrowHeadSize * Math.sin(radians + arrowHeadAngle)

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* Compass circle */}
        <circle cx={center} cy={center} r={radius} fill="white dark:fill-slate-800" stroke="#94a3b8 dark:stroke-slate-600" strokeWidth="1" />

        {/* Cardinal direction markers */}
        <text x={center} y={center - radius + 5} textAnchor="middle" fontSize="12" fill="#64748b">
          N
        </text>
        <text x={center + radius - 5} y={center + 4} textAnchor="middle" fontSize="12" fill="#64748b">
          E
        </text>
        <text x={center} y={center + radius - 2} textAnchor="middle" fontSize="12" fill="#64748b">
          S
        </text>
        <text x={center - radius + 5} y={center + 4} textAnchor="middle" fontSize="12" fill="#64748b">
          W
        </text>

        {/* Direction arrow */}
        <line x1={center} y1={center} x2={arrowX} y2={arrowY} stroke="#3b82f6" strokeWidth="2.5" />

        {/* Arrow head */}
        <polygon
          points={`${arrowX},${arrowY} ${arrowHead1X},${arrowHead1Y} ${arrowHead2X},${arrowHead2Y}`}
          fill="#3b82f6"
        />

        {/* Center dot */}
        <circle cx={center} cy={center} r="3" fill="#3b82f6" />
      </svg>
    )
  }

  // Helper function to get wave height description
  const getWaveHeightDescription = (height: number) => {
    if (height < 1.6) return "Calm"
    if (height < 3.3) return "Smooth"
    if (height < 4.9) return "Slight"
    if (height < 8.2) return "Moderate"
    if (height < 13.1) return "Rough"
    if (height < 19.7) return "Very Rough"
    if (height < 29.5) return "High"
    return "Very High"
  }

  // Helper function to get wave period description
  const getWavePeriodDescription = (period: number) => {
    if (period < 5) return "Wind Chop"
    if (period < 8) return "Wind Waves"
    if (period < 10) return "Short-Period Swell"
    if (period < 13) return "Medium-Period Swell"
    return "Long-Period Swell"
  }

  // Helper function to convert feet to meters
  const feetToMeters = (feet: number) => {
    return feet * 0.3048
  }

  // Format timestamp to time string
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Waves className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Stormglass Surf Forecast</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Search for a Surf Spot</CardTitle>
            <CardDescription className="dark:text-slate-300">
              Enter a beach, surf spot, or city name to get detailed marine and weather forecasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationSearchForm />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold dark:text-slate-100">About Stormglass.io</h2>
          <p className="text-muted-foreground">
            Stormglass.io provides high-resolution forecasts for up to 10 days ahead as well as historical data. Marine
            data including tide is available for all oceans and seas worldwide.
          </p>

          <h3 className="text-lg font-medium dark:text-slate-200">Available Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Marine Weather</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                  <li>Wave Height, Direction & Period</li>
                  <li>Swell Height, Direction & Period</li>
                  <li>Water Temperature</li>
                  <li>Current Speed & Direction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tide Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                  <li>Tide Height</li>
                  <li>High & Low Tide Times</li>
                  <li>Tide Extremes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weather Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                  <li>Air Temperature</li>
                  <li>Pressure & Humidity</li>
                  <li>Cloud Coverage</li>
                  <li>Precipitation</li>
                  <li>Wind Speed & Direction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Astronomy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                  <li>Sunrise & Sunset Times</li>
                  <li>Moonrise & Moonset Times</li>
                  <li>Moon Phase</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
