// Types for water temperature data
export interface WaterTemperatureData {
  temperature: number // Temperature in Celsius
  timestamp: number // Unix timestamp
  source: string // Data source
  station: string // Station ID
}

// NOAA Station ID for Santa Monica Bay
// 46222 is the Santa Monica Basin buoy
const SANTA_MONICA_BUOY = "46222"

// Function to get water temperature data for Santa Monica Bay
export async function getWaterTemperature(): Promise<WaterTemperatureData | null> {
  try {
    console.log("Fetching water temperature data from NOAA NDBC...")

    // NDBC API endpoint for latest buoy data
    // This returns the latest observations from the buoy in a text format
    const response = await fetch(
      `https://www.ndbc.noaa.gov/data/realtime2/${SANTA_MONICA_BUOY}.txt`,
      { cache: "no-store" }, // Don't cache to ensure fresh data
    )

    if (!response.ok) {
      console.error(`NDBC API responded with status: ${response.status}`)
      return null
    }

    // Get the text response
    const text = await response.text()
    console.log("NDBC response received, length:", text.length)

    // Parse the NDBC text format
    // The format is a space-delimited text file with header rows
    const lines = text.trim().split("\n")

    if (lines.length < 3) {
      console.error("Invalid data format from NDBC API: not enough lines")
      return null
    }

    // Log the first few lines to debug
    console.log("NDBC line 0:", lines[0])
    console.log("NDBC line 1:", lines[1])
    console.log("NDBC line 2:", lines[2])

    // The first line is typically the header with column names
    // The second line might be units (e.g., "degC")
    // The third line and beyond should contain actual data

    const headerLine = lines[0].trim().split(/\s+/)

    // Find the index of the water temperature column (WTMP)
    // NDBC sometimes uses "WTMP" or "WTEMP" for water temperature
    const wtmpIndex = headerLine.findIndex((col) => col === "WTMP" || col === "WTEMP")

    if (wtmpIndex === -1) {
      console.error("Water temperature column not found in NDBC response")
      console.log("Available columns:", headerLine.join(", "))
      return null
    }

    // Look for the first data line that has a numeric value for water temperature
    let waterTempC = null
    let dataLine = null
    let year, month, day, hour, minute

    // Start from line 2 (index 2) which should be the first data line
    for (let i = 2; i < Math.min(lines.length, 10); i++) {
      const currentLine = lines[i].trim().split(/\s+/)

      if (currentLine.length <= wtmpIndex) {
        console.log(`Line ${i} doesn't have enough columns, skipping`)
        continue
      }

      const tempValue = currentLine[wtmpIndex]
      console.log(`Line ${i}, temp value: "${tempValue}"`)

      // Skip missing data indicators
      if (!tempValue || tempValue === "MM" || tempValue === "degC") {
        continue
      }

      // Try to parse as a number
      const parsedTemp = Number.parseFloat(tempValue)
      if (!isNaN(parsedTemp)) {
        waterTempC = parsedTemp
        dataLine = currentLine

        // Try to parse date components
        try {
          year = Number.parseInt(currentLine[0])
          month = Number.parseInt(currentLine[1]) - 1 // JavaScript months are 0-indexed
          day = Number.parseInt(currentLine[2])
          hour = Number.parseInt(currentLine[3])
          minute = Number.parseInt(currentLine[4])

          // If we have valid date and temperature, we can stop looking
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
            console.log(`Found valid data on line ${i}`)
            break
          }
        } catch (e) {
          console.log(`Couldn't parse date on line ${i}, continuing search`)
        }
      }
    }

    // If we couldn't find a valid temperature, use fallback
    if (waterTempC === null || dataLine === null) {
      console.error("Could not find valid water temperature data in NDBC response")
      return null
    }

    console.log(`Parsed water temperature: ${waterTempC}°C`)

    // Create timestamp from date components or use current time as fallback
    let timestamp
    try {
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
        throw new Error("Invalid date components")
      }
      timestamp = new Date(year, month, day, hour, minute).getTime() / 1000
    } catch (dateError) {
      console.error("Error creating date from components, using current time:", dateError)
      timestamp = Math.floor(Date.now() / 1000)
    }

    return {
      temperature: waterTempC,
      timestamp,
      source: "NOAA NDBC",
      station: SANTA_MONICA_BUOY,
    }
  } catch (error) {
    console.error("Error fetching water temperature data from NDBC:", error)
    return null
  }
}

// Alternative method using NOAA CO-OPS API for stations that support it
export async function getWaterTemperatureFromCOOPS(stationId = "9410840"): Promise<WaterTemperatureData | null> {
  try {
    console.log(`Fetching water temperature data from NOAA CO-OPS for station ${stationId}...`)

    // NOAA CO-OPS API for water temperature
    const response = await fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `station=${stationId}&date=latest&product=water_temperature&datum=MLLW&units=metric&time_zone=lst_ldt&format=json`,
      { cache: "no-store" }, // Don't cache to ensure fresh data
    )

    if (!response.ok) {
      console.error(`NOAA CO-OPS API responded with status: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("CO-OPS response:", data)

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error("Invalid data format from NOAA CO-OPS API")
      return null
    }

    const latestReading = data.data[0]

    if (!latestReading.t || !latestReading.v) {
      console.error("Missing time or value in CO-OPS data")
      return null
    }

    const timestamp = new Date(latestReading.t).getTime() / 1000

    // Parse the temperature value, handling both string and number formats
    let temperature
    if (typeof latestReading.v === "number") {
      temperature = latestReading.v
    } else {
      // Try to extract a numeric value from the string
      const numericMatch = latestReading.v.toString().match(/(-?\d+(\.\d+)?)/)
      if (!numericMatch) {
        console.error(`Cannot extract numeric value from CO-OPS temperature: "${latestReading.v}"`)
        return null
      }
      temperature = Number.parseFloat(numericMatch[0])
    }

    if (isNaN(temperature)) {
      console.error(`Invalid temperature value from CO-OPS: "${latestReading.v}"`)
      return null
    }

    console.log(`Parsed CO-OPS water temperature: ${temperature}°C at ${new Date(timestamp * 1000).toISOString()}`)

    return {
      temperature,
      timestamp,
      source: "NOAA CO-OPS",
      station: stationId,
    }
  } catch (error) {
    console.error("Error fetching water temperature data from CO-OPS:", error)
    return null
  }
}

// Fallback to hardcoded recent data if all APIs fail
function getHardcodedWaterTemperature(): WaterTemperatureData {
  // This is actual data from Santa Monica Bay, but should only be used as a last resort
  return {
    temperature: 17.2, // Typical spring water temperature for Santa Monica Bay (Celsius)
    timestamp: Math.floor(Date.now() / 1000),
    source: "Historical Average (Fallback)",
    station: "N/A",
  }
}

// Function to try multiple methods to get water temperature
export async function getReliableWaterTemperature(): Promise<WaterTemperatureData> {
  console.log("Attempting to get water temperature data from multiple sources...")

  // Try the NDBC buoy first
  try {
    const buoyData = await getWaterTemperature()
    if (buoyData) {
      console.log("Successfully retrieved water temperature from NDBC buoy")
      return buoyData
    }
  } catch (error) {
    console.error("Error in NDBC buoy data retrieval:", error)
  }

  // If that fails, try the CO-OPS station
  try {
    const coopsData = await getWaterTemperatureFromCOOPS()
    if (coopsData) {
      console.log("Successfully retrieved water temperature from CO-OPS")
      return coopsData
    }
  } catch (error) {
    console.error("Error in CO-OPS data retrieval:", error)
  }

  // If all methods fail, return hardcoded data
  console.log("All API methods failed, using hardcoded water temperature data")
  return getHardcodedWaterTemperature()
}
