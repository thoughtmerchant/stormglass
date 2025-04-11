// Add this file to ensure we're properly fetching location data

import {
  fetchStormglassData,
  fetchStormglassTideData,
  calculateAstronomyData,
  WEATHER_PARAMS,
  MARINE_PARAMS,
} from "@/lib/stormglass-service"
import { adaptTideData, adaptWaveData, adaptWaterTempData } from "@/lib/data-adapters"

// Function to fetch all data for a location
export async function fetchLocationData(lat: number, lng: number, date: Date) {
  try {
    console.log(`Fetching data for location: ${lat}, ${lng} on ${date.toISOString()}`)

    // Set start time to beginning of the selected date
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    // Set end time to end of the selected date
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Calculate astronomy data
    const astronomy = calculateAstronomyData(lat, lng, date)

    // Fetch weather and marine data
    const params = [...WEATHER_PARAMS, ...MARINE_PARAMS]
    const weatherResponse = await fetchStormglassData(lat, lng, startDate, endDate, params)

    // Fetch tide data - this is critical for the visualization
    const tideResponse = await fetchStormglassTideData(lat, lng, startDate, endDate)

    // Process the responses
    let tideData = null
    let waveData = null
    let waterTempData = null

    // Process tide data if available
    if (!("status" in tideResponse) || tideResponse.status === 200) {
      console.log("Successfully fetched tide data")
      tideData = adaptTideData(tideResponse)
    } else {
      console.error("Failed to fetch tide data:", tideResponse.message)
    }

    // Process wave and water temp data if available
    if (!("status" in weatherResponse) || weatherResponse.status === 200) {
      console.log("Successfully fetched weather/marine data")
      waveData = adaptWaveData(weatherResponse)
      waterTempData = adaptWaterTempData(weatherResponse)
    } else {
      console.error("Failed to fetch weather/marine data:", weatherResponse.message)
    }

    // Calculate time zone offset (approximate based on longitude)
    // Each 15 degrees of longitude corresponds to 1 hour time difference
    const timeZoneOffset = Math.round(lng / 15)

    // Format astronomical times for the visualization
    const astronomicalTimes = {
      firstLight:
        new Date(astronomy.sunrise).getHours() > 0
          ? `${(new Date(astronomy.sunrise).getHours() - 1).toString().padStart(2, "0")}:${new Date(astronomy.sunrise).getMinutes().toString().padStart(2, "0")}`
          : "05:30",
      sunrise: `${new Date(astronomy.sunrise).getHours().toString().padStart(2, "0")}:${new Date(astronomy.sunrise).getMinutes().toString().padStart(2, "0")}`,
      sunset: `${new Date(astronomy.sunset).getHours().toString().padStart(2, "0")}:${new Date(astronomy.sunset).getMinutes().toString().padStart(2, "0")}`,
      lastLight:
        new Date(astronomy.sunset).getHours() < 23
          ? `${(new Date(astronomy.sunset).getHours() + 1).toString().padStart(2, "0")}:${new Date(astronomy.sunset).getMinutes().toString().padStart(2, "0")}`
          : "20:30",
    }

    return {
      tideData,
      waveData,
      waterTempData,
      astronomicalTimes,
      timeZoneOffset,
    }
  } catch (error) {
    console.error("Error fetching location data:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
