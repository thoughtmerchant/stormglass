// Types for tide data
export interface TidePoint {
  dt: number // Unix timestamp
  height: number // Tide height in meters
  type?: string // "high" or "low" for extremes
}

export interface TideData {
  extremes: TidePoint[] // High and low tide points
  heights: TidePoint[] // All tide heights throughout the day
  status: number
  callCount: number
  copyright: string
}

// Function to get tide data for Santa Monica Bay
export async function getTideData(): Promise<TideData> {
  try {
    // Santa Monica Bay coordinates
    const lat = 34.0095
    const lng = -118.5005

    // Current time
    const start = Math.floor(Date.now() / 1000)
    // 24 hours from now
    const end = start + 86400

    // Fetch tide data from WorldTides API
    // Note: In a real application, you would use an API key
    const response = await fetch(
      `https://www.worldtides.info/api/v3?heights&extremes&datum=MLLW&lat=${lat}&lon=${lng}&start=${start}&end=${end}&key=YOUR_API_KEY`,
      { next: { revalidate: 3600 } }, // Revalidate every hour
    )

    if (!response.ok) {
      return getMockTideData()
    }

    const data = await response.json()
    return data as TideData
  } catch (error) {
    console.error("Error fetching tide data:", error)
    return getMockTideData()
  }
}

// Mock data in case the API call fails
function getMockTideData(): TideData {
  const now = Math.floor(Date.now() / 1000)
  const hour = 3600

  return {
    extremes: [
      { dt: now - 2 * hour, height: 0.2, type: "low" },
      { dt: now + 4 * hour, height: 1.8, type: "high" },
      { dt: now + 10 * hour, height: 0.3, type: "low" },
      { dt: now + 16 * hour, height: 1.6, type: "high" },
    ],
    heights: Array.from({ length: 24 }, (_, i) => {
      const time = now + i * hour
      // Create a sine wave pattern for tide heights
      const height = 1 + Math.sin((i / 24) * Math.PI * 2) * 0.8
      return { dt: time, height }
    }),
    status: 200,
    callCount: 1,
    copyright: "Disclaimer: This uses mock data for demonstration purposes",
  }
}
