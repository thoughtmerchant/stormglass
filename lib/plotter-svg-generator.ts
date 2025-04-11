import type { TideData } from "@/lib/noaa-tide-service"
import type { WaveData } from "@/lib/wave-service"
import type { WaterTemperatureData } from "@/components/ocean-data-visualization"
import { isToday } from "@/lib/noaa-tide-service"
import { generateSingleStrokeText } from "@/lib/single-stroke-font"

interface PlotterSvgOptions {
  tideData: TideData | null
  waveData: WaveData | null
  waterTempData: WaterTemperatureData | null
  astronomicalTimes: {
    firstLight: string
    sunrise: string
    sunset: string
    lastLight: string
  }
  penWidth?: number // in mm
  font?: string // font family
  singleStrokeFontUrl?: string // URL to the single stroke font SVG
}

export function generatePlotterSvg(options: PlotterSvgOptions): string {
  const {
    tideData,
    waveData,
    waterTempData,
    astronomicalTimes,
    penWidth = 2,
    font = "Arial",
    singleStrokeFontUrl,
  } = options

  // Convert pen width from mm to SVG stroke width (approximate)
  const strokeWidth = penWidth * 0.5

  // Process tide data
  const { tidePath, tideExtremes } = processTideData(tideData)

  // Format current date
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Generate SVG content - removing the border and simplifying the template string
  const svgContent =
    `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
  <g transform="translate(0, -100)">
    ${waterTempData ? generateTemperatureRings(waterTempData, strokeWidth) : ""}
    ${waveData ? generatePrimarySwellLines(waveData, strokeWidth) : ""}
    ${waveData ? generateWaveHeightMarkers(waveData, strokeWidth) : ""}
    ${tidePath ? `<path d="${tidePath}" fill="none" stroke="black" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" />` : ""}
    ${generateSunEvents(astronomicalTimes, strokeWidth)}
    ${generateSingleStrokeText("VENICE, CALIFORNIA", 400, 790, strokeWidth, 0.8)}
    ${generateSingleStrokeText(formattedDate.toUpperCase(), 400, 835, strokeWidth, 0.6)}
  </g>
</svg>`.trim()

  return svgContent
}

function processTideData(tideData: TideData | null) {
  if (!tideData || !tideData.heights || !Array.isArray(tideData.heights) || tideData.heights.length === 0) {
    return { tidePath: "", tideExtremes: [] }
  }

  const width = 800
  const baseY = 700
  const heightRange = 100

  // Filter to only include today's data for visualization
  const todayHeights = tideData.heights.filter(
    (h) => h && h.t && isToday(h.t) && !isNaN(new Date(h.t).getTime()) && !isNaN(h.v),
  )

  if (todayHeights.length === 0) {
    return { tidePath: "", tideExtremes: [] }
  }

  // Sort points by time to ensure a continuous path
  const sortedPoints = [...todayHeights].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())

  // Find min and max heights for scaling
  const heights = sortedPoints.map((h) => h.v)
  const minHeight = Math.min(...heights)
  const maxHeight = Math.max(...heights)
  const heightRangeFt = maxHeight - minHeight || 1 // Prevent division by zero

  // Generate points for the curve
  const points = sortedPoints.map((point) => {
    // Convert time to x position
    const date = new Date(point.t)
    const minutes = date.getHours() * 60 + date.getMinutes()
    const x = (minutes / 1440) * width

    // Convert height to y position
    const normalizedHeight = (point.v - minHeight) / heightRangeFt
    const y = baseY - normalizedHeight * heightRange

    return { x, y }
  })

  // Create path - ensure we're not creating duplicate paths
  let path = ""
  if (points.length > 0) {
    path = `M ${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`
    }
  }

  // Find extremes (high and low tides) for today only
  const todayExtremes = tideData.extremes.filter(
    (extreme) => extreme && extreme.t && isToday(extreme.t) && extreme.type && !isNaN(extreme.v),
  )

  const extremes = todayExtremes.map((extreme) => {
    const date = new Date(extreme.t)
    const minutes = date.getHours() * 60 + date.getMinutes()
    const x = (minutes / 1440) * width

    const normalizedHeight = (extreme.v - minHeight) / heightRangeFt
    const y = baseY - normalizedHeight * heightRange

    return {
      x,
      y,
      height: extreme.v,
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: extreme.type,
    }
  })

  return { tidePath: path, tideExtremes: extremes }
}

function timeToX(timeStr: string): number {
  if (!timeStr) return 0

  try {
    const [hours, minutes] = timeStr.split(":").map(Number)

    if (isNaN(hours) || isNaN(minutes)) {
      return 0
    }

    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / 1440) * 800
  } catch (error) {
    return 0
  }
}

function generateTemperatureRings(waterTempData: WaterTemperatureData, strokeWidth: number): string {
  let rings = ""

  // Convert Celsius to Fahrenheit
  const tempF = (waterTempData.temperature * 9) / 5 + 32

  // Calculate number of rings (each ring is 10°F)
  const numRings = Math.ceil(tempF / 10)

  // Set the inner diameter to 300px (radius = 150)
  const baseRadius = 150
  const ringSpacing = 10

  for (let i = 0; i < numRings; i++) {
    const radius = baseRadius + i * ringSpacing
    rings += `
      <circle cx="400" cy="400" r="${radius}" fill="none" stroke="black" stroke-width="${strokeWidth * 0.5}" />
    `
  }

  return rings
}

function generatePrimarySwellLines(waveData: WaveData, strokeWidth: number): string {
  if (!waveData || !waveData.forecast || waveData.forecast.length === 0) {
    return ""
  }

  const centerX = 400
  const centerY = 400
  const maxRadius = 340

  // Extract primary swell directions
  const primarySwells = getPrimarySwellDirections(waveData)

  if (primarySwells.length === 0) {
    return ""
  }

  let lines = ""

  primarySwells.forEach((swell, index) => {
    // Convert to radians and adjust for SVG coordinate system
    const angleRad = (Math.PI * (90 - swell.direction)) / 180

    // Calculate line length based on wave height
    // Scale the length based on the biggest swell
    const maxHeight = primarySwells[0].height
    const scaleFactor = swell.height / maxHeight
    const length = maxRadius * scaleFactor

    // Calculate end point
    const endX = centerX + length * Math.cos(angleRad)
    const endY = centerY - length * Math.sin(angleRad)

    lines += `
      <line 
        x1="${centerX}" 
        y1="${centerY}" 
        x2="${endX}" 
        y2="${endY}" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.75}" 
        stroke-linecap="round" 
      />
    `
  })

  return lines
}

function getPrimarySwellDirections(waveData: WaveData) {
  if (!waveData || !waveData.forecast || waveData.forecast.length === 0) {
    return []
  }

  // Combine current and forecast data
  const allWavePoints = [waveData.current, ...waveData.forecast]

  // Group by direction (rounded to nearest 5 degrees)
  const swellsByDirection: Record<string, any[]> = {}

  allWavePoints.forEach((point) => {
    // Round direction to nearest 5 degrees
    const roundedDirection = Math.round(point.direction / 5) * 5
    const key = `${roundedDirection}`

    if (!swellsByDirection[key]) {
      swellsByDirection[key] = []
    }

    swellsByDirection[key].push(point)
  })

  // Calculate average height for each direction
  const directionAverages = Object.entries(swellsByDirection).map(([direction, points]) => {
    const totalHeight = points.reduce((sum, point) => sum + point.height, 0)
    const avgHeight = totalHeight / points.length
    const avgPeriod = points.reduce((sum, point) => sum + point.period, 0) / points.length

    return {
      direction: Number.parseInt(direction),
      height: avgHeight,
      period: avgPeriod,
      directionText: points[0].directionText,
      count: points.length,
    }
  })

  // Sort by height (descending) and take top 3
  return directionAverages.sort((a, b) => b.height - a.height).slice(0, 3)
}

function generateWaveHeightMarkers(waveData: WaveData, strokeWidth: number): string {
  if (!waveData || !waveData.forecast || !waveData.current || waveData.forecast.length === 0) {
    return ""
  }

  const centerY = 400
  let markers = ""

  // Only include a subset of forecast points for cleaner visualization
  const filteredForecast = waveData.forecast.filter((_, index) => index % 2 === 0)

  // Forecast wave heights
  filteredForecast.forEach((forecast) => {
    if (!forecast) return

    const minutes = new Date(forecast.time * 1000).getHours() * 60 + new Date(forecast.time * 1000).getMinutes()
    const x = (minutes / 1440) * 800

    const heightLine = calculateWaveHeightLine(forecast.height)
    const halfHeight = heightLine / 2

    markers += `
      <line 
        x1="${x}" 
        y1="${centerY - halfHeight}" 
        x2="${x}" 
        y2="${centerY + halfHeight}" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.5}" 
      />
    `
  })

  return markers
}

function calculateWaveHeightLine(heightFt: number): number {
  const MIN_HEIGHT_PX = 10
  const MAX_HEIGHT_PX = 400

  // Divide the height by 3 as requested
  const adjustedHeight = heightFt / 3

  // Simple multiplication for dramatic effect
  const heightPx = adjustedHeight * 40 // Each foot = 40 pixels

  // Ensure we stay within bounds
  if (heightPx < MIN_HEIGHT_PX) return MIN_HEIGHT_PX
  if (heightPx > MAX_HEIGHT_PX) return MAX_HEIGHT_PX

  return heightPx
}

function generateSunEvents(
  astronomicalTimes: { firstLight: string; sunrise: string; sunset: string; lastLight: string },
  strokeWidth: number,
): string {
  let events = ""

  // First light (dawn) - open circle
  if (astronomicalTimes.firstLight && !isNaN(timeToX(astronomicalTimes.firstLight))) {
    events += `
      <circle 
        cx="${timeToX(astronomicalTimes.firstLight)}" 
        cy="350" 
        r="8" 
        fill="none" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.5}" 
      />
    `
  }

  // Sunrise - larger open circle
  if (astronomicalTimes.sunrise && !isNaN(timeToX(astronomicalTimes.sunrise))) {
    events += `
      <circle 
        cx="${timeToX(astronomicalTimes.sunrise)}" 
        cy="400" 
        r="24" 
        fill="none" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.5}" 
      />
    `
  }

  // Sunset - hatched circle with calculated line segments
  if (astronomicalTimes.sunset && !isNaN(timeToX(astronomicalTimes.sunset))) {
    const cx = timeToX(astronomicalTimes.sunset)
    const cy = 400
    const r = 24

    // Draw the circle outline
    events += `
      <circle 
        cx="${cx}" 
        cy="${cy}" 
        r="${r}" 
        fill="none" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.5}" 
      />
    `

    // Add horizontal hatching lines with calculated endpoints
    // Spacing of approximately 4 pixels
    const spacing = 4
    for (let y = cy - r + spacing / 2; y <= cy + r - spacing / 2; y += spacing) {
      // Calculate the x-coordinates where the horizontal line at y intersects the circle
      // Using the circle equation: (x - cx)² + (y - cy)² = r²
      // Solving for x: x = cx ± √(r² - (y - cy)²)
      const dy = y - cy
      const dx = Math.sqrt(r * r - dy * dy)

      const x1 = cx - dx
      const x2 = cx + dx

      events += `
        <line 
          x1="${x1}" 
          y1="${y}" 
          x2="${x2}" 
          y2="${y}" 
          stroke="black" 
          stroke-width="${strokeWidth * 0.25}" 
        />
      `
    }
  }

  // Last light (dusk) - horizontal hatched circle with calculated line segments
  if (astronomicalTimes.lastLight && !isNaN(timeToX(astronomicalTimes.lastLight))) {
    const cx = timeToX(astronomicalTimes.lastLight)
    const cy = 450
    const r = 8

    // Draw the circle outline
    events += `
      <circle 
        cx="${cx}" 
        cy="${cy}" 
        r="${r}" 
        fill="none" 
        stroke="black" 
        stroke-width="${strokeWidth * 0.5}" 
      />
    `

    // Add horizontal hatching lines with calculated endpoints
    // Convert 2mm to pixels (approximate)
    const mmToPixels = 3 // Approximate conversion factor
    const spacing = 2 * mmToPixels // 2mm spacing

    // Calculate how many lines we need
    const diameter = 2 * r
    const numLines = Math.max(3, Math.floor(diameter / spacing))

    // Calculate the actual spacing to distribute lines evenly
    const actualSpacing = diameter / (numLines - 1)

    // Create evenly spaced horizontal lines
    for (let i = 0; i < numLines; i++) {
      const y = cy - r + i * actualSpacing

      // Calculate the x-coordinates where the horizontal line at y intersects the circle
      const dy = y - cy
      const dx = Math.sqrt(Math.max(0, r * r - dy * dy)) // Ensure we don't take sqrt of negative number

      const x1 = cx - dx
      const x2 = cx + dx

      events += `
        <line 
          x1="${x1}" 
          y1="${y}" 
          x2="${x2}" 
          y2="${y}" 
          stroke="black" 
          stroke-width="${strokeWidth * 0.5}" 
        />
      `
    }
  }

  return events
}
