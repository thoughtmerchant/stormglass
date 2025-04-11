"use server"

import type { TideData } from "@/lib/noaa-tide-service"
import type { WaveData } from "@/lib/wave-service"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"
import { processHeights } from "@/lib/noaa-tide-service"
import { metersToFeet } from "@/lib/data-adapters"

// Venice Pier coordinates
const VENICE_COORDINATES = {
  lat: 33.983, // Venice Pier, CA latitude
  lng: -118.4591, // Venice Pier, CA longitude
}

// NOAA Station IDs
const SANTA_MONICA_TIDE_STATION = "9410840" // Santa Monica tide station
const SANTA_MONICA_BUOY = "46222" // Santa Monica Basin buoy

// Function to fetch historical tide data from NOAA
export async function fetchHistoricalTideData(date: Date): Promise<any> {
  try {
    // Format date for API request
    const formattedDate = formatDateForAPI(date)

    // Fetch tide data from NOAA API
    const response = await fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `station=9410840&begin_date=${formattedDate}&end_date=${formattedDate}` +
        `&product=predictions&datum=MLLW&time_zone=lst_ldt&units=metric&format=json`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`NOAA API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.predictions || !Array.isArray(data.predictions)) {
      throw new Error("Invalid data format from NOAA API")
    }

    // Process the tide data - convert heights from meters to feet
    const heights = data.predictions.map((p: any) => ({
      t: p.t,
      v: metersToFeet(Number.parseFloat(p.v)), // Convert from meters to feet
    }))

    // Process to identify extremes
    const processedHeights = processHeights(heights)

    // Get current tide information
    const current = getCurrentTide(processedHeights, date)

    return {
      heights: processedHeights,
      current,
      extremes: processedHeights.filter((h: any) => h.type === "high" || h.type === "low"),
    }
  } catch (error) {
    console.error("Error fetching historical tide data:", error)
    throw error
  }
}

// Function to fetch historical water level data (actual measurements)
export async function fetchHistoricalWaterLevelData(date: Date): Promise<any | null> {
  try {
    // Format date for NOAA API
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}${month}${day}`

    // Calculate the next day for the end date
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextYear = nextDay.getFullYear()
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0")
    const nextDay_day = String(nextDay.getDate()).padStart(2, "0")
    const formattedNextDate = `${nextYear}${nextMonth}${nextDay_day}`

    console.log(
      `Fetching historical water level data for ${formattedDate} from NOAA station ${SANTA_MONICA_TIDE_STATION}`,
    )

    // Create an AbortController with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      // Fetch actual water level measurements from NOAA CO-OPS API
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
          `station=${SANTA_MONICA_TIDE_STATION}&begin_date=${formattedDate}&end_date=${formattedNextDate}` +
          `&product=water_level&datum=MLLW&time_zone=lst_ldt&units=english&format=json`,
        {
          next: { revalidate: 3600 * 24 }, // Cache for 24 hours
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId) // Clear the timeout if the request completes

      if (!response.ok) {
        console.log(`NOAA API responded with status: ${response.status}`)
        return null
      }

      const data = await response.json()

      if (!data.data || !Array.isArray(data.data)) {
        console.log("Invalid data format from NOAA API")
        return null
      }

      console.log(`Received ${data.data.length} water level measurements from NOAA`)

      return data
    } catch (fetchError) {
      clearTimeout(timeoutId) // Clear the timeout if there's an error
      if (fetchError.name === "AbortError") {
        console.log("Fetch request timed out")
      } else {
        console.error("Error in fetch:", fetchError)
      }
      return null
    }
  } catch (error) {
    console.log("Error fetching historical water level data:", error)
    return null
  }
}

// Function to fetch historical wave data
export async function fetchHistoricalWaveData(date: Date): Promise<WaveData | null> {
  try {
    // Format date for NOAA API
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}${month}${day}`

    // Calculate the next day for the end date
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextYear = nextDay.getFullYear()
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0")
    const nextDay_day = String(nextDay.getDate()).padStart(2, "0")
    const formattedNextDate = `${nextYear}${nextMonth}${nextDay_day}`

    console.log(`Attempting to fetch historical wave data for ${formattedDate} using NOAA CO-OPS API`)

    // Try to fetch wave height data if available
    // Note: This may not be available for all stations or dates
    const response = await fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `station=${SANTA_MONICA_TIDE_STATION}&begin_date=${formattedDate}&end_date=${formattedNextDate}` +
        `&product=wave_height&datum=MLLW&time_zone=lst_ldt&units=english&format=json`,
      { next: { revalidate: 3600 * 24 } }, // Cache for 24 hours
    )

    // If wave height data is not available, return mock data instead of throwing
    if (!response.ok) {
      console.log(`Wave height data not available from NOAA CO-OPS API for station ${SANTA_MONICA_TIDE_STATION}`)
      return getMockWaveData(date)
    }

    const data = await response.json()

    // Check if we got valid wave data
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log(`No wave data available from NOAA CO-OPS API for date ${formattedDate}`)
      return getMockWaveData(date)
    }

    console.log(`Received ${data.data.length} wave height measurements from NOAA CO-OPS API`)

    // Process the wave data
    const waveData = data.data.map((point: any) => {
      const timestamp = new Date(point.t).getTime() / 1000
      const height = Number.parseFloat(point.v)

      // We may not have period and direction data from this API
      // Use reasonable defaults based on the date
      const period = 10 // Default period
      const direction = 270 // Default direction (west)

      return {
        time: timestamp,
        height: height,
        period: period,
        direction: direction,
        directionText: degreesToCardinal(direction),
      }
    })

    // Sort by time
    waveData.sort((a, b) => a.time - b.time)

    // Create hourly forecast data
    const hourlyForecast: Record<number, any> = {}

    waveData.forEach((data) => {
      const hour = new Date(data.time * 1000).getHours()
      hourlyForecast[hour] = data
    })

    // Use the noon data point as current if available, otherwise use the first data point
    const noonIndex = waveData.findIndex((data) => new Date(data.time * 1000).getHours() === 12)
    const current = noonIndex >= 0 ? waveData[noonIndex] : waveData[0]

    return {
      current,
      forecast: waveData,
      hourlyForecast,
      status: 200,
      source: `NOAA CO-OPS API Historical Wave Data`,
    }
  } catch (error) {
    console.error("Error fetching historical wave data:", error)
    // Return mock data instead of throwing
    return getMockWaveData(date)
  }
}

// Function to fetch historical water temperature data
export async function fetchHistoricalWaterTemperature(date: Date): Promise<WaterTemperatureData | null> {
  try {
    // Format date for NOAA API
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}${month}${day}`

    // Calculate the next day for the end date
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextYear = nextDay.getFullYear()
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0")
    const nextDay_day = String(nextDay.getDate()).padStart(2, "0")
    const formattedNextDate = `${nextYear}${nextMonth}${nextDay_day}`

    console.log(`Attempting to fetch historical water temperature for ${formattedDate} using NOAA CO-OPS API`)

    // Try to fetch water temperature data if available
    const response = await fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `station=${SANTA_MONICA_TIDE_STATION}&begin_date=${formattedDate}&end_date=${formattedNextDate}` +
        `&product=water_temperature&datum=MLLW&time_zone=lst_ldt&units=english&format=json`,
      { next: { revalidate: 3600 * 24 } }, // Cache for 24 hours
    )

    // If water temperature data is not available, return mock data
    if (!response.ok) {
      console.log(`Water temperature data not available from NOAA CO-OPS API`)
      return getMockWaterTemperature(date)
    }

    const data = await response.json()

    // Check if we got valid water temperature data
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log(`No water temperature data available from NOAA CO-OPS API`)
      return getMockWaterTemperature(date)
    }

    console.log(`Received ${data.data.length} water temperature measurements from NOAA CO-OPS API`)

    // Find a data point with valid water temperature
    // Preferably around noon for consistency
    const noonHour = 12
    let bestPoint = data.data[0]
    let minHourDiff = 24

    for (const point of data.data) {
      const pointTime = new Date(point.t)
      const hourDiff = Math.abs(pointTime.getHours() - noonHour)

      if (hourDiff < minHourDiff) {
        minHourDiff = hourDiff
        bestPoint = point
      }
    }

    // Convert Fahrenheit to Celsius (NOAA reports in Fahrenheit)
    const tempF = Number.parseFloat(bestPoint.v)
    const tempC = ((tempF - 32) * 5) / 9

    return {
      temperature: tempC,
      timestamp: new Date(bestPoint.t).getTime() / 1000,
      source: `NOAA CO-OPS API`,
      station: SANTA_MONICA_TIDE_STATION,
    }
  } catch (error) {
    console.error("Error fetching historical water temperature:", error)
    return getMockWaterTemperature(date)
  }
}

// Function to get astronomical times for a specific date
export function getAstronomicalTimesForDate(date: Date): {
  firstLight: string
  sunrise: string
  sunset: string
  lastLight: string
} {
  try {
    // Use SunCalc library to calculate actual astronomical times
    // This would be implemented with a proper astronomy library in a real application

    // For this example, we'll use a simplified calculation based on the date
    // Day of year (0-365)
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

    // Simplified seasonal variation for Venice Pier (33.9830° N, 118.4591° W)
    // Summer solstice: ~June 21 (day 172) - earliest sunrise, latest sunset
    // Winter solstice: ~December 21 (day 355) - latest sunrise, earliest sunset

    // Calculate sunrise/sunset times based on day of year
    // This is a simplified model - real calculations would use solar position algorithms
    const summerSunrise = "05:42" // Earliest sunrise
    const winterSunrise = "06:55" // Latest sunrise
    const summerSunset = "20:08" // Latest sunset
    const winterSunset = "16:48" // Earliest sunset

    // Calculate where we are in the annual cycle (0-1, where 0.5 is summer solstice, 0 or 1 is winter solstice)
    const annualPosition = Math.abs((dayOfYear - 172) / 365) * 2

    // Interpolate between summer and winter times
    const sunriseHour = interpolateTime(summerSunrise, winterSunrise, annualPosition)
    const sunsetHour = interpolateTime(summerSunset, winterSunset, 1 - annualPosition)

    // First light is ~30 minutes before sunrise
    const firstLightTime = subtractMinutes(sunriseHour, 30)

    // Last light is ~30 minutes after sunset
    const lastLightTime = addMinutes(sunsetHour, 30)

    return {
      firstLight: firstLightTime,
      sunrise: sunriseHour,
      sunset: sunsetHour,
      lastLight: lastLightTime,
    }
  } catch (error) {
    console.error("Error calculating astronomical times:", error)

    // Return default times if calculation fails
    return {
      firstLight: "06:00",
      sunrise: "06:30",
      sunset: "19:30",
      lastLight: "20:00",
    }
  }
}

// Helper function to interpolate between two time strings
function interpolateTime(time1: string, time2: string, factor: number): string {
  // Convert times to minutes since midnight
  const [h1, m1] = time1.split(":").map(Number)
  const [h2, m2] = time2.split(":").map(Number)

  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2

  // Interpolate
  const resultMinutes = Math.round(minutes1 + (minutes2 - minutes1) * factor)

  // Convert back to HH:MM
  const hours = Math.floor(resultMinutes / 60)
  const minutes = resultMinutes % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

// Helper function to add minutes to a time string
function addMinutes(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number)

  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60

  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
}

// Helper function to subtract minutes from a time string
function subtractMinutes(time: string, minutesToSubtract: number): string {
  const [hours, minutes] = time.split(":").map(Number)

  let totalMinutes = hours * 60 + minutes - minutesToSubtract
  if (totalMinutes < 0) totalMinutes += 24 * 60 // Wrap around to previous day

  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60

  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
}

// Function to fetch all historical marine data for a specific date
export async function fetchHistoricalMarineData(date: Date) {
  try {
    // Create an object to store all the data
    const result: any = {
      astronomicalTimes: getAstronomicalTimesForDate(date),
      lastUpdated: new Date().toISOString(),
    }

    // Try to fetch each type of data independently
    // If any fails, we'll still have the other types
    try {
      result.tideData = await fetchHistoricalTideData(date)
    } catch (error) {
      console.error("Failed to fetch tide data:", error)
      result.tideError = error instanceof Error ? error.message : "Unknown error fetching tide data"
    }

    try {
      result.waveData = await fetchHistoricalWaveData(date)
    } catch (error) {
      console.error("Failed to fetch wave data:", error)
      result.waveError = error instanceof Error ? error.message : "Unknown error fetching wave data"
      // Set waveData to null explicitly to ensure it's handled properly
      result.waveData = null
    }

    try {
      result.waterTempData = await fetchHistoricalWaterTemperature(date)
    } catch (error) {
      console.error("Failed to fetch water temperature data:", error)
      result.waterTempError = error instanceof Error ? error.message : "Unknown error fetching water temperature data"
      // Set waterTempData to null explicitly
      result.waterTempData = null
    }

    // Water level data is optional and non-critical
    result.waterLevelData = await fetchHistoricalWaterLevelData(date).catch((error) => {
      console.log("Water level data unavailable, continuing without it:", error)
      return null
    })

    // Check if we have any data at all
    if (!result.tideData && !result.waveData && !result.waterTempData && !result.waterLevelData) {
      throw new Error("No data available for the selected date")
    }

    return result
  } catch (error) {
    console.error("Error in fetchHistoricalMarineData:", error)
    throw error
  }
}

// Add this function to generate mock tide data for any date
function getMockTideData(date: Date): TideData {
  console.log(`Generating mock tide data for ${date.toDateString()}`)

  // Create a consistent start of day for the given date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  // Create 24 hours of tide data with a simple sine wave pattern
  const points = 24 * 4 // 15-minute intervals
  const heights: any[] = []

  for (let i = 0; i < points; i++) {
    const time = new Date(startOfDay)
    time.setMinutes(i * (60 / 4)) // 15-minute intervals

    // Simple sine wave pattern for tide heights (feet)
    // Two high tides and two low tides in a day
    const hourFraction = (i / points) * 24
    const height = 3 + 2 * Math.sin((hourFraction / 12) * Math.PI * 2)

    heights.push({
      t: time.toISOString(),
      v: height,
    })
  }

  // Process to identify extremes
  const processedHeights = processHeights(heights)

  // Extract extremes
  const extremes = processedHeights.filter((h) => h.type === "high" || h.type === "low")

  // Get current tide information
  const currentTide = getCurrentTideForDate(processedHeights, date)

  return {
    heights: processedHeights,
    current: currentTide,
    extremes: extremes,
  }
}

// Add this function to generate mock wave data for any date
function getMockWaveData(date: Date): WaveData {
  console.log(`Generating mock wave data for ${date.toDateString()}`)

  // Create a consistent start of day for the given date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  // Create wave data points for the day
  const wavePoints = []
  const hourlyForecast: Record<number, any> = {}

  // Generate data for each hour
  for (let hour = 0; hour < 24; hour++) {
    const time = new Date(startOfDay)
    time.setHours(hour)
    const timestamp = Math.floor(time.getTime() / 1000)

    // Use date components to generate consistent but varied wave data
    // This ensures the same date always produces the same mock data
    const day = date.getDate()
    const month = date.getMonth() + 1

    // Base height varies by month (higher in winter, lower in summer)
    const baseHeight = 3 + Math.sin((month / 12) * Math.PI * 2) * 2

    // Daily variation based on hour
    const hourlyVariation = Math.sin((hour / 24) * Math.PI * 2) * 0.8

    // Add some variation based on the day
    const dailyVariation = (day % 5) * 0.2

    const height = baseHeight + hourlyVariation + dailyVariation

    // Wave period also varies seasonally
    const basePeriod = 10 + Math.sin((month / 12) * Math.PI * 2) * 3
    const period = Math.max(6, Math.min(16, basePeriod + (day % 3)))

    // Direction varies throughout the day
    const baseDirection = 270 // West
    const direction = (baseDirection + hour * 3 + day) % 360

    const point = {
      time: timestamp,
      height,
      period,
      direction,
      directionText: degreesToCardinal(direction),
    }

    wavePoints.push(point)
    hourlyForecast[hour] = point
  }

  // Use noon as the current wave data
  const current = hourlyForecast[12] || wavePoints[0]

  return {
    current,
    forecast: wavePoints,
    hourlyForecast,
    status: 200,
    source: "Mock Wave Data (Historical)",
  }
}

// Add this function to generate mock water temperature data
function getMockWaterTemperature(date: Date): WaterTemperatureData {
  console.log(`Generating mock water temperature for ${date.toDateString()}`)

  // Water temperature varies seasonally
  // Use the month to determine the base temperature (Celsius)
  const month = date.getMonth() + 1 // 1-12

  // Southern California water temperatures range from about 14°C in winter to 20°C in summer
  const baseTemp = 17 // Average temperature
  const seasonalVariation = Math.sin(((month - 1) / 12) * Math.PI * 2) * 3 // ±3°C seasonal variation

  // Add some daily variation based on the day of month
  const dailyVariation = ((date.getDate() % 5) - 2) * 0.2 // ±0.4°C daily variation

  // Calculate the temperature
  const temperature = baseTemp + seasonalVariation + dailyVariation

  return {
    temperature,
    timestamp: Math.floor(date.getTime() / 1000),
    source: "Mock Water Temperature Data (Historical)",
    station: SANTA_MONICA_TIDE_STATION,
  }
}

// Get current tide information for a specific date
function getCurrentTideForDate(heights: any[], date: Date): any {
  // Check if heights is a valid array
  if (!heights || !Array.isArray(heights) || heights.length === 0) {
    console.warn("getCurrentTide received invalid heights data")
    return {
      height: 0,
      trend: "rising",
      nextExtreme: null,
    }
  }

  // Set time to noon on the selected date for a representative "current" time
  const targetTime = new Date(date)
  targetTime.setHours(12, 0, 0, 0)

  // Find the closest tide prediction to target time
  let closestIndex = 0
  let minDiff = Number.POSITIVE_INFINITY

  for (let index = 0; index < heights.length; index++) {
    const height = heights[index]
    if (!height || !height.t) continue

    const predTime = new Date(height.t)
    const diff = Math.abs(predTime.getTime() - targetTime.getTime())

    if (diff < minDiff) {
      minDiff = diff
      closestIndex = index
    }
  }

  // Determine if tide is rising or falling
  let trend: "rising" | "falling" = "rising"

  if (closestIndex < heights.length - 1) {
    trend = heights[closestIndex + 1].v > heights[closestIndex].v ? "rising" : "falling"
  } else if (closestIndex > 0) {
    trend = heights[closestIndex].v > heights[closestIndex - 1].v ? "rising" : "falling"
  }

  // Find next extreme tide (high or low)
  let nextExtreme = null

  for (let i = closestIndex + 1; i < heights.length; i++) {
    if (heights[i].type === "high" || heights[i].type === "low") {
      nextExtreme = {
        t: heights[i].t,
        v: heights[i].v,
        type: heights[i].type,
      }
      break
    }
  }

  return {
    height: heights[closestIndex].v,
    trend,
    nextExtreme,
  }
}

// Helper function to convert degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return cardinals[index]
}

// Helper function to process heights and identify extremes
function processHeightsData(heights: any[]): any[] {
  if (!heights || heights.length < 3) {
    return heights
  }

  // Sort by time
  heights.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())

  // Identify extremes (high and low tides)
  for (let i = 1; i < heights.length - 1; i++) {
    const prev = heights[i - 1].v
    const curr = heights[i].v
    const next = heights[i + 1].v

    // High tide
    if (curr > prev && curr >= next) {
      heights[i].type = "high"
    }
    // Low tide
    else if (curr < prev && curr <= next) {
      heights[i].type = "low"
    }
  }

  return heights
}

// Helper function to get tide information for a specific date
function getCurrentTide(heights: any[], date: Date): any {
  if (!heights || heights.length === 0) {
    return {
      height: 0,
      trend: "rising",
      nextExtreme: null,
    }
  }

  // Use noon as the reference time for historical data
  const noon = new Date(date)
  noon.setHours(12, 0, 0, 0)

  // Find the closest tide prediction to noon
  let closestIndex = 0
  let minDiff = Number.POSITIVE_INFINITY

  for (let i = 0; i < heights.length; i++) {
    const predTime = new Date(heights[i].t)
    const diff = Math.abs(predTime.getTime() - noon.getTime())

    if (diff < minDiff) {
      minDiff = diff
      closestIndex = i
    }
  }

  // Determine if tide is rising or falling
  let trend: "rising" | "falling" = "rising"

  if (closestIndex < heights.length - 1) {
    trend = heights[closestIndex + 1].v > heights[closestIndex].v ? "rising" : "falling"
  } else if (closestIndex > 0) {
    trend = heights[closestIndex].v > heights[closestIndex - 1].v ? "rising" : "falling"
  }

  // Find next extreme tide (high or low)
  let nextExtreme = null

  for (let i = closestIndex + 1; i < heights.length; i++) {
    if (heights[i].type === "high" || heights[i].type === "low") {
      nextExtreme = {
        t: heights[i].t,
        v: heights[i].v,
        type: heights[i].type,
      }
      break
    }
  }

  return {
    height: heights[closestIndex].v,
    trend,
    nextExtreme,
  }
}

// Helper function to format date for API
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}
