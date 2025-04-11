import type { WaveData, WavePoint } from "./wave-service"

// NOAA GFS API configuration
const NOAA_API_BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
const NOAA_BUOY_API = "https://www.ndbc.noaa.gov/data/realtime2"

// Nearest buoy to Santa Monica Bay
const SANTA_MONICA_BUOY = "46222" // Santa Monica Basin buoy

interface BuoyData {
  waveHeight: number
  wavePeriod: number
  waveDirection: number
  timestamp: number
}

export async function fetchLiveWaveData(): Promise<WaveData | null> {
  try {
    console.log("Fetching live wave data from NOAA...")

    // Fetch the latest buoy data
    const buoyData = await fetchBuoyData()

    if (!buoyData) {
      console.error("Failed to fetch buoy data")
      return null
    }

    // Fetch forecast data from NOAA GFS
    const forecastData = await fetchWaveForecast()

    // Create the wave data object
    const waveData: WaveData = {
      current: {
        time: buoyData.timestamp,
        height: buoyData.waveHeight,
        period: buoyData.wavePeriod,
        direction: buoyData.waveDirection,
        directionText: degreesToCardinal(buoyData.waveDirection),
      },
      forecast: forecastData || [],
      hourlyForecast: generateHourlyForecast(forecastData || []),
      status: 200,
      source: "NOAA NDBC Buoy " + SANTA_MONICA_BUOY,
    }

    return waveData
  } catch (error) {
    console.error("Error fetching live wave data:", error)
    return null
  }
}

// Generate hourly forecast from the available data points
function generateHourlyForecast(forecast: WavePoint[]): Record<number, WavePoint> {
  const hourlyData: Record<number, WavePoint> = {}

  // Get current date and set to start of day
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  // For each hour of the day (0-23)
  for (let hour = 0; hour < 24; hour++) {
    const hourTime = new Date(startOfDay)
    hourTime.setHours(hour)
    const hourTimestamp = Math.floor(hourTime.getTime() / 1000)

    // Find the closest forecast point to this hour
    let closestPoint: WavePoint | null = null
    let minTimeDiff = Number.POSITIVE_INFINITY

    for (const point of forecast) {
      const timeDiff = Math.abs(point.time - hourTimestamp)
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff
        closestPoint = point
      }
    }

    // If we found a point within 2 hours, use it
    if (closestPoint && minTimeDiff <= 7200) {
      // 2 hours in seconds
      hourlyData[hour] = {
        ...closestPoint,
        time: hourTimestamp, // Set to exact hour
      }
    }
  }

  return hourlyData
}

async function fetchBuoyData(): Promise<BuoyData | null> {
  try {
    // In a real implementation, we would fetch the latest data from the NDBC buoy
    // For example: https://www.ndbc.noaa.gov/data/realtime2/46222.txt
    // This would require parsing the text file format that NDBC provides

    // For demonstration purposes, we'll simulate a successful response
    const now = Math.floor(Date.now() / 1000)

    return {
      waveHeight: 5.9, // feet
      wavePeriod: 12, // seconds
      waveDirection: 285, // degrees
      timestamp: now,
    }
  } catch (error) {
    console.error("Error fetching buoy data:", error)
    return null
  }
}

async function fetchWaveForecast(): Promise<WavePoint[] | null> {
  try {
    // In a real implementation, we would fetch forecast data from NOAA GFS
    // This would typically involve accessing GRIB2 files or using a specialized API

    // For demonstration purposes, we'll create a more detailed forecast with hourly data
    const now = Math.floor(Date.now() / 1000)
    const hour = 3600
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const startOfDayTimestamp = Math.floor(startOfDay.getTime() / 1000)

    // Create a more varied forecast with some missing hours to demonstrate the functionality
    const forecast: WavePoint[] = []

    // Morning conditions (6am - 11am)
    for (let h = 6; h <= 11; h++) {
      // Skip 8am to simulate missing data
      if (h === 8) continue

      forecast.push({
        time: startOfDayTimestamp + h * hour,
        height: 4.5 + (h - 6) * 0.3, // Gradually increasing
        period: 10 + (h - 6) * 0.5,
        direction: 270 + (h - 6) * 2,
        directionText: degreesToCardinal(270 + (h - 6) * 2),
      })
    }

    // Midday peak (12pm - 3pm)
    for (let h = 12; h <= 15; h++) {
      forecast.push({
        time: startOfDayTimestamp + h * hour,
        height: 6.2 + (h - 12) * 0.4, // Peak around 2-3pm
        period: 13,
        direction: 280,
        directionText: degreesToCardinal(280),
      })
    }

    // Afternoon decline (4pm - 8pm)
    for (let h = 16; h <= 20; h++) {
      // Skip 6pm to simulate missing data
      if (h === 18) continue

      forecast.push({
        time: startOfDayTimestamp + h * hour,
        height: 7.8 - (h - 16) * 0.3, // Gradually decreasing
        period: 12 - (h - 16) * 0.5,
        direction: 285 - (h - 16) * 2,
        directionText: degreesToCardinal(285 - (h - 16) * 2),
      })
    }

    return forecast
  } catch (error) {
    console.error("Error fetching wave forecast:", error)
    return null
  }
}

// Helper function to convert degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return cardinals[index]
}
