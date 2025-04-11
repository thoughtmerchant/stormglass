// Types for tide data
export interface TideExtreme {
  t: string // ISO timestamp
  v: number // Height in feet
  type: "high" | "low"
}

export interface TideHeight {
  t: string // ISO timestamp
  v: number // Height in feet
  type?: "high" | "low"
}

export interface NoaaTideData {
  predictions: Array<{
    t: string // ISO timestamp
    v: string // Height as string
  }>
}

export interface TideData {
  heights: TideHeight[]
  current: {
    height: number
    trend: "rising" | "falling"
    nextExtreme: TideExtreme | null
  }
  extremes: TideHeight[]
}

// Santa Monica tide station ID
// 9410840 is the Santa Monica station
const STATION_ID = "9410840"

// Function to get tide data from NOAA
export async function fetchTidePredictions(): Promise<TideHeight[]> {
  try {
    // Get current date in YYYYMMDD format
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const beginDate = formatDateForNoaa(today)
    const endDate = formatDateForNoaa(tomorrow)

    // Fetch tide predictions from NOAA CO-OPS API
    const response = await fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `station=${STATION_ID}&begin_date=${beginDate}&end_date=${endDate}` +
        `&product=predictions&datum=MLLW&time_zone=lst_ldt&units=english&format=json`,
      { cache: "no-store" }, // Don't cache to ensure fresh data
    )

    if (!response.ok) {
      console.error(`NOAA API responded with status: ${response.status}`)
      return getMockTideHeights() // Fallback to mock data if API fails
    }

    const data = (await response.json()) as NoaaTideData

    if (!data.predictions || !Array.isArray(data.predictions)) {
      console.error("Invalid data format from NOAA API")
      return getMockTideHeights() // Fallback to mock data if data format is invalid
    }

    console.log("Successfully fetched NOAA tide data:", {
      count: data.predictions.length,
      sample: data.predictions.slice(0, 2),
    })

    // Convert predictions to heights and identify extremes
    const heights = processHeights(
      data.predictions.map((p) => ({
        t: p.t,
        v: Number.parseFloat(p.v),
      })),
    )

    return heights
  } catch (error) {
    console.error("Error fetching NOAA tide data:", error)
    return getMockTideHeights() // Fallback to mock data on error
  }
}

// Process heights to identify high and low tides
export function processHeights(heights: TideHeight[]): TideHeight[] {
  if (!heights || !Array.isArray(heights) || heights.length < 3) {
    console.warn("Insufficient tide data points for processing")
    return heights
  }

  // Sort by time
  heights.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())

  // Remove any duplicate timestamps
  const uniqueHeights: TideHeight[] = []
  const seenTimes = new Set()

  for (const height of heights) {
    const timeKey = new Date(height.t).getTime()
    if (!seenTimes.has(timeKey)) {
      seenTimes.add(timeKey)
      uniqueHeights.push(height)
    }
  }

  // Identify extremes (high and low tides)
  for (let i = 1; i < uniqueHeights.length - 1; i++) {
    const prev = uniqueHeights[i - 1].v
    const curr = uniqueHeights[i].v
    const next = uniqueHeights[i + 1].v

    // High tide
    if (curr > prev && curr >= next) {
      uniqueHeights[i].type = "high"
    }
    // Low tide
    else if (curr < prev && curr <= next) {
      uniqueHeights[i].type = "low"
    }
  }

  return uniqueHeights
}

// Function to get current tide information
export function getCurrentTide(heights: TideHeight[] | null | undefined): {
  height: number
  trend: "rising" | "falling"
  nextExtreme: TideExtreme | null
} {
  // Check if heights is a valid array
  if (!heights || !Array.isArray(heights) || heights.length === 0) {
    console.warn("getCurrentTide received invalid heights data:", heights)
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

  // Use for loop instead of forEach for better error handling
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
  let nextExtreme: TideExtreme | null = null

  for (let i = closestIndex + 1; i < heights.length; i++) {
    if (heights[i].type === "high" || heights[i].type === "low") {
      nextExtreme = {
        t: heights[i].t,
        v: heights[i].v,
        type: heights[i].type as "high" | "low",
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

// Helper function to format date for NOAA API
function formatDateForNoaa(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

// Helper function to check if a date is today
export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`)
      return false
    }

    // Get today's date in local time
    const today = new Date()

    // Compare year, month, and day using local time
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  } catch (error) {
    console.error(`Error checking if date is today: ${dateString}`, error)
    return false
  }
}

// Consistent mock tide data for testing
function getMockTideHeights(): TideHeight[] {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  // Create 24 hours of tide data with a simple sine wave pattern
  const hours = 24
  const points = 24 * 4 // 15-minute intervals
  const result: TideHeight[] = []

  for (let i = 0; i < points; i++) {
    const time = new Date(startOfDay)
    time.setMinutes(i * (60 / 4)) // 15-minute intervals

    // Simple sine wave pattern for tide heights (feet)
    // Two high tides and two low tides in a day
    const hourFraction = (i / points) * 24
    const height = 3 + 2 * Math.sin((hourFraction / 12) * Math.PI * 2)

    result.push({
      t: time.toISOString(),
      v: height,
    })
  }

  // Process to identify extremes
  return processHeights(result)
}
