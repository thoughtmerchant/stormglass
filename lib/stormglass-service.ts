// Stormglass API service

// API key from environment variable
const STORMGLASS_API_KEY = "98c5c212-1570-11f0-95f7-0242ac130003-98c5c276-1570-11f0-95f7-0242ac130003"
const STORMGLASS_API_URL = "https://api.stormglass.io/v2"

// Available data parameters from Stormglass
export const WEATHER_PARAMS = [
  "airTemperature",
  "pressure",
  "humidity",
  "cloudCover",
  "precipitation",
  "windSpeed",
  "windDirection",
  "gust",
  "visibility",
]

export const MARINE_PARAMS = [
  "waveHeight",
  "waveDirection",
  "wavePeriod",
  "swellHeight",
  "swellDirection",
  "swellPeriod",
  "secondarySwellHeight",
  "secondarySwellDirection",
  "secondarySwellPeriod",
  "waterTemperature",
  "currentSpeed",
  "currentDirection",
]

// Remove the invalid ASTRONOMY_PARAMS since they're not supported by the API
// We'll use mock data for astronomy instead
export const ASTRONOMY_PARAMS: string[] = []

// Combine all parameters
export const ALL_PARAMS = [...WEATHER_PARAMS, ...MARINE_PARAMS]

// Types for the API responses
export interface StormglassPoint {
  time: string
  [key: string]: any
}

export interface StormglassResponse {
  hours: StormglassPoint[]
  meta: {
    dailyQuota: number
    requestCount: number
    lat: number
    lng: number
  }
}

export interface StormglassTideResponse {
  data: {
    time: string
    height: number
    type?: "high" | "low"
  }[]
  meta: {
    dailyQuota: number
    requestCount: number
    lat: number
    lng: number
    station: {
      distance: number
      lat: number
      lng: number
      name: string
      source: string
    }
  }
}

export interface StormglassError {
  status: number
  message: string
}

// Function to fetch weather data from Stormglass
export async function fetchStormglassData(
  lat: number,
  lng: number,
  start: Date,
  end: Date,
  params: string[] = ALL_PARAMS,
): Promise<StormglassResponse | StormglassError> {
  try {
    // Format dates for the API - use ISO string format instead of Unix timestamp
    const startTime = start.toISOString()
    const endTime = end.toISOString()

    console.log(`Fetching Stormglass data for coordinates: ${lat}, ${lng}`)
    console.log(`Time range: ${startTime} to ${endTime}`)
    console.log(`Parameters: ${params.join(", ")}`)

    // Build the URL
    const url = new URL(`${STORMGLASS_API_URL}/weather/point`)
    url.searchParams.append("lat", lat.toString())
    url.searchParams.append("lng", lng.toString())
    url.searchParams.append("params", params.join(","))
    url.searchParams.append("start", startTime)
    url.searchParams.append("end", endTime)

    console.log(`Request URL: ${url.toString()}`)

    // Make the request
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: STORMGLASS_API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // Log response status
    console.log(`Stormglass API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Stormglass API error response: ${errorText}`)

      let errorMessage = "Failed to fetch data from Stormglass"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If parsing fails, use the raw error text
        errorMessage = errorText || errorMessage
      }

      return {
        status: response.status,
        message: errorMessage,
      }
    }

    const data = await response.json()
    console.log("Successfully fetched Stormglass data")
    return data
  } catch (error) {
    console.error("Error fetching Stormglass data:", error)
    return {
      status: 500,
      message: error instanceof Error ? error.message : "Unknown error fetching data from Stormglass",
    }
  }
}

// Function to fetch tide data from Stormglass
export async function fetchStormglassTideData(
  lat: number,
  lng: number,
  start: Date,
  end: Date,
): Promise<StormglassTideResponse | StormglassError> {
  try {
    // Format dates for the API - use ISO string format
    const startTime = start.toISOString()
    const endTime = end.toISOString()

    console.log(`Fetching Stormglass tide data for coordinates: ${lat}, ${lng}`)
    console.log(`Time range: ${startTime} to ${endTime}`)

    // Build the URL
    const url = new URL(`${STORMGLASS_API_URL}/tide/extremes/point`)
    url.searchParams.append("lat", lat.toString())
    url.searchParams.append("lng", lng.toString())
    url.searchParams.append("start", startTime)
    url.searchParams.append("end", endTime)

    console.log(`Tide request URL: ${url.toString()}`)

    // Make the request
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: STORMGLASS_API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // Log response status
    console.log(`Stormglass tide API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Stormglass tide API error response: ${errorText}`)

      let errorMessage = "Failed to fetch tide data from Stormglass"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If parsing fails, use the raw error text
        errorMessage = errorText || errorMessage
      }

      return {
        status: response.status,
        message: errorMessage,
      }
    }

    const data = await response.json()
    console.log("Successfully fetched Stormglass tide data")
    return data
  } catch (error) {
    console.error("Error fetching Stormglass tide data:", error)
    return {
      status: 500,
      message: error instanceof Error ? error.message : "Unknown error fetching tide data from Stormglass",
    }
  }
}

// Function to get a location by name using OpenStreetMap Nominatim API
export async function getLocationByName(locationName: string): Promise<{
  lat: number
  lng: number
  displayName: string
} | null> {
  try {
    console.log(`Searching for location: ${locationName}`)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "SurfForecastApp/1.0",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error(`Location search error: ${response.status}`)
      throw new Error("Failed to fetch location data")
    }

    const data = await response.json()
    console.log(`Location search results: ${data.length} found`)

    if (data.length === 0) {
      return null
    }

    const result = {
      lat: Number.parseFloat(data[0].lat),
      lng: Number.parseFloat(data[0].lon),
      displayName: data[0].display_name,
    }

    console.log(`Found location: ${result.displayName} at ${result.lat}, ${result.lng}`)
    return result
  } catch (error) {
    console.error("Error fetching location:", error)
    return null
  }
}

// Function to generate mock data for testing when API is unavailable
export function generateMockStormglassData(lat: number, lng: number, start: Date, end: Date): StormglassResponse {
  console.log("Generating mock Stormglass data for testing")

  const hours = []
  const startTime = start.getTime()
  const endTime = end.getTime()
  const hourMs = 3600000 // 1 hour in milliseconds

  // Generate data points for each hour
  for (let time = startTime; time <= endTime; time += hourMs) {
    const date = new Date(time)
    const hour = date.getHours()

    // Create data with some variation based on the hour
    const point: StormglassPoint = {
      time: date.toISOString(),

      // Weather data
      airTemperature: { sg: 20 + Math.sin((hour / 24) * Math.PI * 2) * 5 },
      humidity: { sg: 0.7 + Math.sin((hour / 24) * Math.PI) * 0.2 },
      cloudCover: { sg: 0.3 + Math.sin((hour / 12) * Math.PI) * 0.3 },
      precipitation: { sg: Math.max(0, Math.sin((hour / 8) * Math.PI) * 0.05) },
      windSpeed: { sg: 5 + Math.sin((hour / 12) * Math.PI) * 3 },
      windDirection: { sg: 180 + Math.sin((hour / 24) * Math.PI) * 90 },
      visibility: { sg: 10000 - Math.sin((hour / 12) * Math.PI) * 2000 },

      // Marine data - these values are in meters and will be converted to feet in the adapter
      waveHeight: { sg: 1.2 + Math.sin((hour / 12) * Math.PI) * 0.5 },
      waveDirection: { sg: 270 + Math.sin((hour / 24) * Math.PI) * 45 },
      wavePeriod: { sg: 8 + Math.sin((hour / 12) * Math.PI) * 2 },
      swellHeight: { sg: 1 + Math.sin((hour / 12) * Math.PI) * 0.4 },
      swellDirection: { sg: 260 + Math.sin((hour / 24) * Math.PI) * 30 },
      swellPeriod: { sg: 10 + Math.sin((hour / 12) * Math.PI) * 2 },
      waterTemperature: { sg: 18 + Math.sin((hour / 24) * Math.PI) * 2 },
    }

    hours.push(point)
  }

  return {
    hours,
    meta: {
      dailyQuota: 10,
      requestCount: 1,
      lat,
      lng,
    },
  }
}

// Function to generate mock tide data
export function generateMockTideData(lat: number, lng: number, start: Date, end: Date): StormglassTideResponse {
  console.log("Generating mock tide data for testing")

  const startTime = start.getTime()
  const endTime = end.getTime()
  const dayMs = 24 * 3600000 // 24 hours in milliseconds

  // Generate 4 tide extremes per day (2 high, 2 low)
  const data = []

  for (let time = startTime; time <= endTime; time += dayMs / 4) {
    const date = new Date(time)
    const hour = date.getHours()
    const isHigh = data.length % 2 === 0 // Alternate high and low tides

    data.push({
      time: date.toISOString(),
      height: isHigh ? 1.8 + Math.random() * 0.4 : 0.3 + Math.random() * 0.3,
      type: isHigh ? "high" : "low",
    })
  }

  return {
    data,
    meta: {
      dailyQuota: 10,
      requestCount: 1,
      lat,
      lng,
      station: {
        distance: 5.2,
        lat: lat + 0.01,
        lng: lng + 0.01,
        name: "Mock Tide Station",
        source: "Mock Data",
      },
    },
  }
}

// Function to calculate astronomy data based on date and location
// Since the Stormglass API doesn't provide astronomy data, we'll calculate it ourselves
export function calculateAstronomyData(
  lat: number,
  lng: number,
  date: Date,
): {
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  moonPhase: number
} {
  console.log(`Calculating astronomy data for ${date.toDateString()} at ${lat}, ${lng}`)

  // This is a simplified calculation - in a real app, you would use a proper astronomy library

  // Day of year (0-365)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  // Latitude adjustment - days are longer in summer for northern latitudes, shorter for southern
  const latitudeAdjustment =
    lat > 0
      ? Math.sin(((dayOfYear - 172) / 365) * Math.PI * 2) * (lat / 90) * 3 // Northern hemisphere
      : Math.sin(((dayOfYear - 355) / 365) * Math.PI * 2) * (lat / -90) * 3 // Southern hemisphere

  // Base sunrise/sunset times (approximate)
  const baseSunrise = 6 // 6:00 AM
  const baseSunset = 18 // 6:00 PM

  // Adjust for day of year - days are longer in summer, shorter in winter
  const dayLengthAdjustment = Math.sin(((dayOfYear - 172) / 365) * Math.PI * 2) * 2 // ±2 hours

  // Calculate sunrise and sunset
  const sunriseHour = baseSunrise - dayLengthAdjustment / 2 - latitudeAdjustment / 2
  const sunsetHour = baseSunset + dayLengthAdjustment / 2 + latitudeAdjustment / 2

  // Calculate moonrise and moonset (simplified - in reality, these vary significantly)
  // For this mock, we'll offset from sunrise/sunset by a phase-dependent amount
  const moonPhase = (dayOfYear % 29.5) / 29.5 // 0 to 1 representing new moon to new moon
  const moonOffset = moonPhase * 24 // Hours offset based on moon phase

  const moonriseHour = (sunriseHour + moonOffset) % 24
  const moonsetHour = (sunsetHour + moonOffset) % 24

  // Create date objects for each event
  const sunrise = new Date(date)
  sunrise.setHours(Math.floor(sunriseHour), Math.round((sunriseHour % 1) * 60), 0, 0)

  const sunset = new Date(date)
  sunset.setHours(Math.floor(sunsetHour), Math.round((sunsetHour % 1) * 60), 0, 0)

  const moonrise = new Date(date)
  moonrise.setHours(Math.floor(moonriseHour), Math.round((moonriseHour % 1) * 60), 0, 0)

  const moonset = new Date(date)
  moonset.setHours(Math.floor(moonsetHour), Math.round((moonsetHour % 1) * 60), 0, 0)

  return {
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    moonrise: moonrise.toISOString(),
    moonset: moonset.toISOString(),
    moonPhase: moonPhase,
  }
}
