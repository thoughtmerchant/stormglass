import type { StormglassResponse, StormglassTideResponse } from "@/lib/stormglass-service"
import type { TideData } from "@/lib/noaa-tide-service"
import type { WaveData } from "@/lib/wave-service"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"

// Convert Stormglass tide data to the format expected by OceanDataVisualization
export function adaptTideData(stormglassTideData: StormglassTideResponse): TideData {
  // Map the tide extremes
  const extremes = stormglassTideData.data.map((point) => ({
    t: point.time, // ISO timestamp
    v: metersToFeet(point.height), // Convert height from meters to feet
    type: point.type as "high" | "low",
  }))

  // Generate heights data (we need more points for a smooth curve)
  // Since Stormglass only provides extremes, we'll interpolate between them
  const heights = generateInterpolatedTideHeights(extremes)

  // Get current tide information
  const current = getCurrentTideInfo(heights)

  return {
    heights,
    current,
    extremes,
  }
}

// Convert Stormglass wave data to the format expected by OceanDataVisualization
export function adaptWaveData(stormglassData: StormglassResponse): WaveData | null {
  if (!stormglassData || !stormglassData.hours || stormglassData.hours.length === 0) {
    return null
  }

  // Get the noon data point as current
  const noonHour = 12
  let currentPoint = stormglassData.hours[0]
  let minHourDiff = 24

  for (const hourData of stormglassData.hours) {
    const hourTime = new Date(hourData.time)
    const hourDiff = Math.abs(hourTime.getHours() - noonHour)

    if (hourDiff < minHourDiff) {
      minHourDiff = hourDiff
      currentPoint = hourData
    }
  }

  // Convert meters to feet (1 meter = 3.28084 feet)
  const metersToFeet = (meters: number) => meters * 3.28084

  // Map to the expected format
  const current = {
    time: new Date(currentPoint.time).getTime() / 1000,
    height: currentPoint.waveHeight?.sg ? metersToFeet(currentPoint.waveHeight.sg) : 0,
    period: currentPoint.wavePeriod?.sg || 0,
    direction: currentPoint.waveDirection?.sg || 0,
    directionText: degreesToCardinal(currentPoint.waveDirection?.sg || 0),
  }

  // Map all hours to forecast points
  const forecast = stormglassData.hours.map((hour) => ({
    time: new Date(hour.time).getTime() / 1000,
    height: hour.waveHeight?.sg ? metersToFeet(hour.waveHeight.sg) : 0,
    period: hour.wavePeriod?.sg || 0,
    direction: hour.waveDirection?.sg || 0,
    directionText: degreesToCardinal(hour.waveDirection?.sg || 0),
  }))

  // Create hourly forecast data
  const hourlyForecast: Record<number, any> = {}
  stormglassData.hours.forEach((hour) => {
    const hourOfDay = new Date(hour.time).getHours()
    hourlyForecast[hourOfDay] = {
      time: new Date(hour.time).getTime() / 1000,
      height: hour.waveHeight?.sg ? metersToFeet(hour.waveHeight.sg) : 0,
      period: hour.wavePeriod?.sg || 0,
      direction: hour.waveDirection?.sg || 0,
      directionText: degreesToCardinal(hour.waveDirection?.sg || 0),
    }
  })

  return {
    current,
    forecast,
    hourlyForecast,
    status: 200,
    source: "Stormglass.io",
  }
}

// Update the adaptWaterTempData function to ensure temperature is in Fahrenheit
export function adaptWaterTempData(stormglassData: StormglassResponse): WaterTemperatureData | null {
  if (!stormglassData || !stormglassData.hours || stormglassData.hours.length === 0) {
    return null
  }

  // Get the noon data point
  const noonHour = 12
  let tempPoint = stormglassData.hours[0]
  let minHourDiff = 24

  for (const hourData of stormglassData.hours) {
    const hourTime = new Date(hourData.time)
    const hourDiff = Math.abs(hourTime.getHours() - noonHour)

    if (hourDiff < minHourDiff && hourData.waterTemperature?.sg !== undefined) {
      minHourDiff = hourDiff
      tempPoint = hourData
    }
  }

  // If no water temperature data is available
  if (tempPoint.waterTemperature?.sg === undefined) {
    return null
  }

  // Convert Celsius to Fahrenheit
  const tempF = (tempPoint.waterTemperature.sg * 9) / 5 + 32

  return {
    temperature: tempF, // Store as Fahrenheit
    timestamp: new Date(tempPoint.time).getTime() / 1000,
    source: "Stormglass.io",
    station: "Forecast Data",
  }
}

// Helper function to convert degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return cardinals[index]
}

// Helper function to convert meters to feet
export function metersToFeet(meters: number): number {
  return meters * 3.28084
}

// Helper function to generate interpolated tide heights for a smooth curve
function generateInterpolatedTideHeights(extremes: any[]): any[] {
  if (!extremes || extremes.length < 2) {
    // If we don't have enough extremes, generate a simple sine wave
    const heights = []

    // Create 24 hours of tide data with a simple sine wave pattern
    // Use the current date to ensure the data is for "today"
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 24; i++) {
      const time = new Date(today)
      time.setHours(i, 0, 0, 0)

      // Simple sine wave pattern for tide heights
      const height = 1 + Math.sin((i / 24) * Math.PI * 2) * 0.8

      heights.push({
        t: time.toISOString(),
        v: height,
      })
    }

    return heights
  }

  // Sort extremes by time
  const sortedExtremes = [...extremes].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())

  const heights = []
  const pointsPerSegment = 12 // Number of points to generate between each extreme

  // For each pair of consecutive extremes
  for (let i = 0; i < sortedExtremes.length - 1; i++) {
    const start = sortedExtremes[i]
    const end = sortedExtremes[i + 1]

    const startTime = new Date(start.t).getTime()
    const endTime = new Date(end.t).getTime()
    const timeDiff = endTime - startTime
    const heightDiff = end.v - start.v

    // Add the start point
    heights.push(start)

    // Generate intermediate points
    for (let j = 1; j < pointsPerSegment; j++) {
      const fraction = j / pointsPerSegment
      const time = new Date(startTime + timeDiff * fraction)

      // Use a sine wave interpolation for more natural tide curve
      const interpolationFactor = (1 - Math.cos(fraction * Math.PI)) / 2
      const height = start.v + heightDiff * interpolationFactor

      heights.push({
        t: time.toISOString(),
        v: height,
      })
    }
  }

  // Add the last extreme
  heights.push(sortedExtremes[sortedExtremes.length - 1])

  return heights
}

// Helper function to get current tide information
function getCurrentTideInfo(heights: any[]): any {
  if (!heights || heights.length === 0) {
    return {
      height: 0,
      trend: "rising",
      nextExtreme: null,
    }
  }

  // Get current time
  const now = new Date()

  // Find the closest tide prediction to current time
  let closestIndex = 0
  let minDiff = Number.POSITIVE_INFINITY

  for (let index = 0; index < heights.length; index++) {
    const height = heights[index]
    if (!height || !height.t) continue

    const predTime = new Date(height.t)
    const diff = Math.abs(predTime.getTime() - now.getTime())

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
