// Types for wave data
export interface WavePoint {
  time: number // Unix timestamp
  height: number // Wave height in feet
  period: number // Wave period in seconds
  direction: number // Wave direction in degrees
  directionText: string // Cardinal direction
}

export interface WaveData {
  current: WavePoint
  forecast: WavePoint[]
  hourlyForecast?: Record<number, WavePoint> // Added hourly forecast data
  status: number
  source: string
}

// Helper function to convert degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return cardinals[index]
}

// Function to get wave data for Santa Monica Bay
export async function getWaveData(): Promise<WaveData | null> {
  try {
    // Import the NOAA GFS service dynamically to avoid circular dependencies
    const { fetchLiveWaveData } = await import("./noaa-gfs-service")

    // Try to get live data
    const liveData = await fetchLiveWaveData()
    if (liveData) {
      console.log("Successfully fetched live wave data")
      return liveData
    }

    // If no live data, return null instead of mock data
    console.log("No wave data available")
    return null
  } catch (error) {
    console.error("Error in getWaveData:", error)
    // Return null in case of error
    return null
  }
}
