"use client"

import { useEffect, useState, useMemo } from "react"
import type { TideData } from "@/lib/noaa-tide-service"
import type { WaveData } from "@/lib/wave-service"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { isToday } from "@/lib/noaa-tide-service"

interface OceanDataVisualizationProps {
  tideData: TideData | null
  waveData: WaveData | null
  waterTempData: WaterTemperatureData | null
  astronomicalTimes: {
    firstLight: string
    sunrise: string
    sunset: string
    lastLight: string
  }
  timeZoneOffset?: number
  forceDebug?: boolean
}

export interface WaterTemperatureData {
  temperature: number
  time: number
}

export function OceanDataVisualization({
  tideData,
  waveData,
  waterTempData,
  astronomicalTimes,
  timeZoneOffset,
  forceDebug,
}: OceanDataVisualizationProps) {
  const [mounted, setMounted] = useState(false)
  const [debug, setDebug] = useState(forceDebug || false)
  const [showTimeIndicator, setShowTimeIndicator] = useState(false)

  // Process tide data with useMemo to prevent recalculation
  const { tidePath, tideExtremes } = useMemo(() => {
    if (!tideData || !tideData.heights || !Array.isArray(tideData.heights) || tideData.heights.length === 0) {
      console.warn("No tide data available for visualization, generating fallback tide curve")

      // Generate a fallback tide curve that spans the entire 24-hour period
      const width = 800
      const baseY = 700
      // For fallback data, use a moderate default range
      // Simulate a moderate 4ft tide range (scale factor of 0.4)
      const heightRange = 100 * 0.4

      // Create a simple sine wave as fallback
      const points = []
      const numPoints = 48 // Generate a point every 30 minutes

      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width

        // Create a sine wave with two cycles over 24 hours
        const normalizedHeight = 0.5 + 0.4 * Math.sin((i / (numPoints - 1)) * Math.PI * 4)
        const y = baseY - normalizedHeight * heightRange

        points.push({ x, y })
      }

      // Create a smooth path
      let path = `M ${points[0].x},${points[0].y}`

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1]
        const currPoint = points[i]

        if (i > 1 && i < points.length - 1) {
          const prevPrevPoint = points[i - 2]
          const nextPoint = points[i + 1]

          // Calculate control points
          const cp1x = prevPoint.x + (currPoint.x - prevPrevPoint.x) / 6
          const cp1y = prevPoint.y + (currPoint.y - prevPrevPoint.y) / 6
          const cp2x = currPoint.x - (nextPoint.x - prevPoint.x) / 6
          const cp2y = currPoint.y - (nextPoint.y - prevPoint.y) / 6

          path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currPoint.x},${currPoint.y}`
        } else {
          const cpx = (prevPoint.x + currPoint.x) / 2
          const cpy = (prevPoint.y + currPoint.y) / 2

          path += ` Q ${prevPoint.x},${prevPoint.y} ${cpx},${cpy}`
          path += ` Q ${currPoint.x},${currPoint.y} ${currPoint.x},${currPoint.y}`
        }
      }

      return { tidePath: path, tideExtremes: [] }
    }

    const width = 800
    const baseY = 700
    // Calculate the tide range and set a proportional visual amplitude
    const tideRange = 0
    // Scale factor determines how dramatic the amplitude appears
    // Small ranges (< 2ft) get minimal amplitude, large ranges (> 10ft) get maximum amplitude
    const scaleFactor = 1
    // Base height is 100px, scale it by the tide range
    const heightRange = 100

    // Filter to only include today's data for visualization
    const todayHeights = tideData.heights.filter(
      (h) => h && h.t && isToday(h.t) && !isNaN(new Date(h.t).getTime()) && !isNaN(h.v),
    )

    if (todayHeights.length === 0) {
      console.warn("No valid tide height data found for today, generating fallback tide curve")

      // Generate a simple sine wave as fallback
      const points = []
      const numPoints = 48 // Generate a point every 30 minutes

      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width

        // Create a sine wave with two cycles over 24 hours
        const normalizedHeight = 0.5 + 0.4 * Math.sin((i / (numPoints - 1)) * Math.PI * 4)
        const y = baseY - normalizedHeight * heightRange

        points.push({ x, y })
      }

      // Create a smooth path
      let path = `M ${points[0].x},${points[0].y}`

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1]
        const currPoint = points[i]

        if (i > 1 && i < points.length - 1) {
          const prevPrevPoint = points[i - 2]
          const nextPoint = points[i + 1]

          // Calculate control points
          const cp1x = prevPoint.x + (currPoint.x - prevPrevPoint.x) / 6
          const cp1y = prevPoint.y + (currPoint.y - prevPrevPoint.y) / 6
          const cp2x = currPoint.x - (nextPoint.x - prevPoint.x) / 6
          const cp2y = currPoint.y - (nextPoint.y - prevPoint.y) / 6

          path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currPoint.x},${currPoint.y}`
        } else {
          const cpx = (prevPoint.x + currPoint.x) / 2
          const cpy = (prevPoint.y + currPoint.y) / 2

          path += ` Q ${prevPoint.x},${prevPoint.y} ${cpx},${cpy}`
          path += ` Q ${currPoint.x},${currPoint.y} ${currPoint.x},${currPoint.y}`
        }
      }

      return { tidePath: path, tideExtremes: [] }
    }

    console.log(`Processing ${todayHeights.length} valid tide heights for today's visualization`)

    // Sort points by time to ensure a continuous path
    const sortedPoints = [...todayHeights].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())

    // Find min and max heights for scaling
    const heights = sortedPoints.map((h) => h.v)
    const minHeight = Math.min(...heights)
    const maxHeight = Math.max(...heights)
    const heightRangeFt = maxHeight - minHeight || 1 // Prevent division by zero

    console.log(`Today's tide height range: ${minHeight}ft to ${maxHeight}ft`)

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

    // Ensure we have points covering the full 24-hour period
    // If we don't have points at the beginning or end of the day, add them
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]

    // Add point at beginning of day if needed
    if (firstPoint.x > 0) {
      // Extrapolate a point at x=0
      const extrapolatedY = firstPoint.y
      points.unshift({ x: 0, y: extrapolatedY })
    }

    // Add point at end of day if needed
    if (lastPoint.x < width) {
      // Extrapolate a point at x=width
      const extrapolatedY = lastPoint.y
      points.push({ x: width, y: extrapolatedY })
    }

    // Create path with smooth curve instead of straight lines
    let path = ""
    if (points.length > 0) {
      // Start at the first point
      path = `M ${points[0].x},${points[0].y}`

      // For each subsequent point, create a smooth curve
      for (let i = 1; i < points.length; i++) {
        // Use a cubic bezier curve for smoothing
        // Calculate control points for a smooth curve
        const prevPoint = points[i - 1]
        const currPoint = points[i]

        // If we have enough points, use the previous and next points to calculate control points
        if (i > 1 && i < points.length - 1) {
          const prevPrevPoint = points[i - 2]
          const nextPoint = points[i + 1]

          // Calculate control points based on surrounding points
          const cp1x = prevPoint.x + (currPoint.x - prevPrevPoint.x) / 6
          const cp1y = prevPoint.y + (currPoint.y - prevPrevPoint.y) / 6
          const cp2x = currPoint.x - (nextPoint.x - prevPoint.x) / 6
          const cp2y = currPoint.y - (nextPoint.y - prevPoint.y) / 6

          // Add cubic bezier curve
          path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currPoint.x},${currPoint.y}`
        } else {
          // For the first and last segments, use a simpler approach
          const cpx = (prevPoint.x + currPoint.x) / 2
          const cpy = (prevPoint.y + currPoint.y) / 2

          // Add quadratic bezier curve
          path += ` Q ${prevPoint.x},${prevPoint.y} ${cpx},${cpy}`
          path += ` Q ${currPoint.x},${currPoint.y} ${currPoint.x},${currPoint.y}`
        }
      }
    }

    // Find extremes (high and low tides) for today only
    const todayExtremes = tideData.extremes.filter(
      (extreme) => extreme && extreme.t && isToday(extreme.t) && extreme.type && !isNaN(extreme.v),
    )

    // Add debug logging to see what extremes are available and which ones are being filtered
    console.log(`Found ${tideData.extremes.length} total tide extremes`)
    console.log(`Found ${todayExtremes.length} tide extremes for today's visualization`)

    if (debug) {
      console.log(
        "All extremes:",
        tideData.extremes.map((e) => ({
          time: new Date(e.t).toLocaleString(),
          height: e.v,
          type: e.type,
          isToday: isToday(e.t),
        })),
      )
    }

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
  }, [tideData, debug])

  // Log tide data for debugging
  useEffect(() => {
    setMounted(true)

    // If forceDebug is true, ensure debug mode stays on
    if (forceDebug) {
      setDebug(true)
    }

    if (tideData) {
      console.log("Tide data received for visualization:", {
        heightsCount: tideData.heights?.length || 0,
        extremesCount: tideData.extremes?.length || 0,
        currentHeight: tideData.current?.height,
        currentTrend: tideData.current?.trend,
        todayHeightsCount: tideData.heights?.filter((h) => h && h.t && isToday(h.t)).length || 0,
        todayExtremesCount: tideData.extremes?.filter((e) => e && e.t && isToday(e.t)).length || 0,
      })
    }

    if (waveData && waveData.forecast) {
      console.log("Wave forecast data received:", waveData.forecast.length, "points")
    }
  }, [tideData, waveData, forceDebug])

  if (!mounted) return null

  // Helper function to convert time string to x position
  const timeToX = (timeStr: string): number => {
    if (!timeStr) return 0 // Default to 0 if no time string is provided

    try {
      // First, check if the time string contains AM/PM
      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        console.warn(`Invalid time format: ${timeStr}. Expected 24-hour format (HH:MM).`)

        // Try to convert from 12-hour to 24-hour format
        const [timePart, period] = timeStr.split(" ")
        const [hours, minutes] = timePart.split(":").map(Number)

        let hour24 = hours
        if (period === "PM" && hours < 12) hour24 += 12
        if (period === "AM" && hours === 12) hour24 = 0

        // Use the converted 24-hour time
        const totalMinutes = hour24 * 60 + minutes
        return (totalMinutes / 1440) * 800 // 1440 minutes in a day, 800px width
      }

      // Regular 24-hour format parsing
      const [hours, minutes] = timeStr.split(":").map(Number)

      // Check if hours or minutes are NaN
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format: ${timeStr}. Expected 24-hour format (HH:MM).`)
        return 0
      }

      const totalMinutes = hours * 60 + minutes
      return (totalMinutes / 1440) * 800 // 1440 minutes in a day, 800px width
    } catch (error) {
      console.warn(`Error parsing time: ${timeStr}`, error)
      return 0
    }
  }

  // Calculate wave height line with simple dramatic scaling
  const calculateWaveHeightLine = (heightFt: number): number => {
    const MIN_HEIGHT_PX = 10
    const MAX_HEIGHT_PX = 400

    // Use the actual height without dividing by 3
    const adjustedHeight = heightFt

    // Simple multiplication for dramatic effect
    const heightPx = adjustedHeight * 40 // Each foot = 40 pixels

    // Ensure we stay within bounds
    if (heightPx < MIN_HEIGHT_PX) return MIN_HEIGHT_PX
    if (heightPx > MAX_HEIGHT_PX) return MAX_HEIGHT_PX

    return heightPx
  }

  // Create wave height markers - updated to remove current wave height marker
  const createWaveHeightMarkers = () => {
    if (!waveData || !waveData.forecast || !waveData.current || waveData.forecast.length === 0) {
      return []
    }

    const centerY = 400 // Center position for wave height lines
    const markers = []

    // Process forecast points for all hours
    // Create a map of hours to forecast points
    const hourlyForecasts: Record<number, any> = {}

    waveData.forecast.forEach((forecast) => {
      if (!forecast) return // Skip if forecast point is undefined

      const forecastTime = new Date(forecast.time * 1000)
      const hour = forecastTime.getHours()

      // Store the forecast for this hour
      hourlyForecasts[hour] = forecast
    })

    // Now create markers for all 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const forecast = hourlyForecasts[hour]
      const x = (hour / 24) * 800 // Position based on hour

      // Determine height based on whether it's an even or odd hour
      let heightLine, halfHeight

      if (hour % 2 === 0) {
        // Even hours - use actual height if available
        if (forecast) {
          heightLine = calculateWaveHeightLine(forecast.height)
        } else {
          // If no data for this even hour, use placeholder
          heightLine = 40
        }
      } else {
        // Odd hours - always use placeholder height
        heightLine = 40
      }

      halfHeight = heightLine / 2

      // Add the line marker
      markers.push(
        <line
          key={`hour-${hour}`}
          x1={x}
          y1={centerY - halfHeight}
          x2={x}
          y2={centerY + halfHeight}
          stroke={hour % 2 === 0 && forecast ? "#333333" : "#cccccc"}
          strokeWidth={hour % 2 === 0 && forecast ? "1.5" : "1"}
          opacity={hour % 2 === 0 && forecast ? "0.7" : "0.5"}
        />,
      )

      // Add hour label below only in debug mode
      if (debug) {
        markers.push(
          <text
            key={`hour-label-${hour}`}
            x={x}
            y={centerY + halfHeight + 20}
            textAnchor="middle"
            fontSize="9"
            fill="#666666"
          >
            {hour}:00
          </text>,
        )
      }

      // Add height label in debug mode for even hours with actual data
      if (debug && hour % 2 === 0 && forecast) {
        markers.push(
          <text
            key={`forecast-height-${hour}`}
            x={x}
            y={centerY - halfHeight - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#666666"
          >
            {forecast.height.toFixed(1)}ft
          </text>,
        )
      }
    }

    return markers
  }

  // Update the createSwellDirectionLines function to match the primary swell lines exactly
  const createSwellDirectionLines = () => {
    const centerX = 400
    const centerY = 400
    const maxRadius = 340

    if (!waveData || !waveData.current) {
      return null
    }

    // Convert to radians and adjust for SVG coordinate system
    const angleRad = (Math.PI * (90 - waveData.current.direction)) / 180

    // Use the same scaling logic as in createPrimarySwellLines
    let length
    if (waveData.current.height < 4) {
      // For small swells (< 4ft), scale from 30px to 100px
      length = 30 + (waveData.current.height / 4) * 70
    } else {
      // For larger swells, scale from 100px to maxRadius
      // 100ft is theoretical maximum (340px)
      length = 100 + ((waveData.current.height - 4) / (100 - 4)) * (maxRadius - 100)
    }

    // Ensure we don't exceed maxRadius
    length = Math.min(length, maxRadius)

    // Calculate end point
    const endX = centerX + length * Math.cos(angleRad)
    const endY = centerY - length * Math.sin(angleRad)

    // Use exactly 1px stroke with 100% opacity - same as primary swell lines
    return (
      <>
        <line
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke="#000000"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="1"
        />
        {debug && (
          <>
            <text x={endX} y={endY - 15} textAnchor="middle" fontSize="10" fill="#333333" fontWeight="500">
              {waveData.current.height.toFixed(1)}ft
            </text>
            <text x={endX} y={endY + 15} textAnchor="middle" fontSize="10" fill="#666666">
              {waveData.current.directionText} @{" "}
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </text>
          </>
        )}
      </>
    )
  }

  // Create temperature rings
  const createTemperatureRings = () => {
    const rings = []

    // Check if water temperature data is available
    if (!waterTempData) {
      console.error("No water temperature data available for visualization")
      return rings
    }

    // Temperature is already in Fahrenheit from the adapter
    const tempF = waterTempData.temperature

    // Calculate number of rings (each ring is 10°F)
    // Starting from 10°F, so we need floor(tempF/10) rings
    const numRings = Math.floor(tempF / 10)

    // Set the inner diameter to 300px (radius = 150)
    const baseRadius = 150
    const ringSpacing = 10

    for (let i = 0; i < numRings; i++) {
      const radius = baseRadius + i * ringSpacing
      const temp = (i + 1) * 10 // Starting from 10°F, each ring is +10°F

      rings.push(
        <circle
          key={`ring-${i}`}
          cx="400"
          cy="400"
          r={radius}
          stroke="#000000"
          strokeWidth="1"
          fill="none"
          opacity="0.7"
        />,
      )

      if (debug) {
        rings.push(
          <text
            key={`temp-${i}`}
            x="400"
            y={400 - radius}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#666666"
          >
            {temp}°F
          </text>,
        )
      }
    }

    return rings
  }

  // Extract the primary swell directions
  const getPrimarySwellDirections = () => {
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

  // Create primary swell direction lines
  const createPrimarySwellLines = () => {
    const centerX = 400
    const centerY = 400
    const maxRadius = 340

    const primarySwells = getPrimarySwellDirections()

    if (primarySwells.length === 0) {
      return null
    }

    return (
      <>
        {primarySwells.map((swell, index) => {
          // Convert to radians and adjust for SVG coordinate system
          const angleRad = (Math.PI * (90 - swell.direction)) / 180

          // Calculate line length based on absolute wave height
          // For swells below 4ft, keep them under 100px
          // For a theoretical 100ft swell, use the max radius
          // Scale everything else proportionally
          let length
          if (swell.height < 4) {
            // For small swells (< 4ft), scale from 30px to 100px
            length = 30 + (swell.height / 4) * 70
          } else {
            // For larger swells, scale from 100px to maxRadius
            // 100ft is theoretical maximum (340px)
            length = 100 + ((swell.height - 4) / (100 - 4)) * (maxRadius - 100)
          }

          // Ensure we don't exceed maxRadius
          length = Math.min(length, maxRadius)

          // Calculate end point
          const endX = centerX + length * Math.cos(angleRad)
          const endY = centerY - length * Math.sin(angleRad)

          return (
            <g key={`swell-${index}`}>
              {/* Line - now 1px with 100% opacity */}
              <line
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="#000000"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="1"
              />

              {/* Debug information - only shown in debug mode */}
              {debug && (
                <text
                  x={endX + 5 * Math.cos(angleRad)}
                  y={endY - 5 * Math.sin(angleRad)}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#000000"
                >
                  {swell.direction}° {swell.height.toFixed(1)}ft
                </text>
              )}
            </g>
          )
        })}
      </>
    )
  }

  // Create high and low tide markers with labels
  const createTideExtremeMarkers = () => {
    if (!tideExtremes || tideExtremes.length === 0) {
      return null
    }

    return (
      <>
        {tideExtremes.map((extreme, index) => {
          // Determine marker style based on tide type
          const isHigh = extreme.type === "high"
          const markerColor = isHigh ? "#0066cc" : "#cc6600"
          const markerSize = 6

          return (
            <g key={`tide-extreme-${index}`}>
              {/* Marker dot */}
              <circle
                cx={extreme.x}
                cy={extreme.y}
                r={markerSize}
                fill={markerColor}
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Debug information - always shown in debug mode */}
              {debug && (
                <>
                  {/* Tide type label */}
                  <text
                    x={extreme.x}
                    y={extreme.y - 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={markerColor}
                  >
                    {isHigh ? "High" : "Low"} Tide
                  </text>

                  {/* Time label */}
                  <text x={extreme.x} y={extreme.y - 35} textAnchor="middle" fontSize="10" fill="#333333">
                    {extreme.time}
                  </text>

                  {/* Height label */}
                  <text x={extreme.x} y={extreme.y + 20} textAnchor="middle" fontSize="10" fill="#333333">
                    {extreme.height.toFixed(1)}ft
                  </text>
                </>
              )}
            </g>
          )
        })}
      </>
    )
  }

  // Add this new function before the return statement to create the debug table
  const renderDebugTable = () => {
    if (!waveData) return null

    // Get the primary swell directions for the table
    const primarySwells = getPrimarySwellDirections()

    // Add current swell data
    const allSwellData = [
      {
        type: "Current",
        direction: waveData.current.direction,
        directionText: waveData.current.directionText,
        height: waveData.current.height,
        period: waveData.current.period,
      },
      ...primarySwells.map((swell, index) => ({
        type: `Primary ${index + 1}`,
        direction: swell.direction,
        directionText: swell.directionText,
        height: swell.height,
        period: swell.period,
      })),
    ]

    return (
      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-medium mb-2">Swell Data (Debug)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 text-left">Type</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Direction</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Size (ft)</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Period (s)</th>
              </tr>
            </thead>
            <tbody>
              {allSwellData.map((swell, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border border-slate-300 px-3 py-2 font-medium">{swell.type}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    {swell.directionText} ({swell.direction.toFixed(0)}°)
                  </td>
                  <td className="border border-slate-300 px-3 py-2">{swell.height.toFixed(1)}</td>
                  <td className="border border-slate-300 px-3 py-2">{swell.period.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add tide extremes table */}
        {tideExtremes && tideExtremes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Tide Extremes (Debug)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2 text-left">Type</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Time</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Height (ft)</th>
                  </tr>
                </thead>
                <tbody>
                  {tideExtremes.map((extreme, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 px-3 py-2 font-medium">
                        {extreme.type === "high" ? "High Tide" : "Low Tide"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">{extreme.time}</td>
                      <td className="border border-slate-300 px-3 py-2">{extreme.height.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Simplified UI controls section */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch id="time-indicator" checked={showTimeIndicator} onCheckedChange={setShowTimeIndicator} />
          <Label htmlFor="time-indicator">Show Current Time</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="debug-mode" checked={debug} onCheckedChange={setDebug} disabled={forceDebug} />
          <Label htmlFor="debug-mode">Debug Mode{forceDebug ? " (Always On)" : ""}</Label>
        </div>
      </div>

      <div className="w-full aspect-square max-w-3xl mx-auto">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          <defs>
            <style type="text/css">
              {`
                text {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  font-size: 10px;
                }
              `}
            </style>
          </defs>

          {/* Background */}
          <rect width="800" height="800" fill="#ffffff" />

          {/* Content group - moved up 100px */}
          <g transform="translate(0, -100)">
            {/* Debug hour lines */}
            {debug &&
              Array.from({ length: 24 }).map((_, hour) => {
                const x = (hour / 24) * 800
                return (
                  <g key={`hour-${hour}`}>
                    <line x1={x} y1="0" x2={x} y2="800" stroke="#cccccc" strokeWidth="1" strokeDasharray="4,4" />
                    <text x={x} y="20" textAnchor="middle" fontSize="10" fill="#999999">
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </text>
                  </g>
                )
              })}

            {/* Temperature rings */}
            {createTemperatureRings()}

            {/* Wave period sine wave at 12 o'clock */}
            {/* Period sine wave removed as requested */}

            {/* Primary swell direction lines */}
            {createPrimarySwellLines()}

            {/* Wave height markers - always show if wave data is available */}
            {waveData && createWaveHeightMarkers()}

            {/* Swell direction line - always show if wave data is available */}
            {waveData && createSwellDirectionLines()}

            {/* Tide curve - always render, either with real data or fallback */}
            {tidePath && (
              <path
                d={tidePath}
                stroke="#0066cc"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* High and low tide markers with labels */}
            {createTideExtremeMarkers()}

            {/* Current time indicator - changed to black dotted line */}
            {showTimeIndicator &&
              (() => {
                const now = new Date()

                // If we have a time zone offset, adjust the current time to the local time zone
                let localNow = new Date(now)
                if (timeZoneOffset !== undefined) {
                  // Get UTC time
                  const utcHours = now.getUTCHours()
                  const utcMinutes = now.getUTCMinutes()

                  // Apply the time zone offset to get local time
                  let localHours = (utcHours + timeZoneOffset) % 24
                  if (localHours < 0) localHours += 24

                  // Create a new date with the local time
                  localNow = new Date(now)
                  localNow.setHours(localHours, utcMinutes)
                }

                const minutes = localNow.getHours() * 60 + localNow.getMinutes()
                const x = (minutes / 1440) * 800
                return (
                  <g>
                    <line x1={x} y1="0" x2={x} y2="800" stroke="#333333" strokeWidth="1" strokeDasharray="2,2" />
                    {debug && (
                      <text x={x} y="40" textAnchor="middle" fontSize="10" fill="#333333">
                        Local Time: {localNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </text>
                    )}
                  </g>
                )
              })()}

            {/* Sun events - with white fill to hide lines underneath */}
            {/* First light (dawn) - open circle */}
            {astronomicalTimes.firstLight && !isNaN(timeToX(astronomicalTimes.firstLight)) && (
              <g>
                <circle cx={timeToX(astronomicalTimes.firstLight)} cy="350" r="10" fill="white" />
                <circle
                  cx={timeToX(astronomicalTimes.firstLight)}
                  cy="350"
                  r="8"
                  stroke="#666666"
                  strokeWidth="1"
                  fill="white"
                />
                {debug && (
                  <>
                    <text
                      x={timeToX(astronomicalTimes.firstLight)}
                      y="330"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666666"
                    >
                      First Light
                    </text>

                    <text
                      x={timeToX(astronomicalTimes.firstLight)}
                      y="315"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666666"
                    >
                      {astronomicalTimes.firstLight}
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Sunrise - larger open circle */}
            {astronomicalTimes.sunrise && !isNaN(timeToX(astronomicalTimes.sunrise)) && (
              <g>
                <circle cx={timeToX(astronomicalTimes.sunrise)} cy="400" r="26" fill="white" />
                <circle
                  cx={timeToX(astronomicalTimes.sunrise)}
                  cy="400"
                  r="24"
                  stroke="#333333"
                  strokeWidth="1"
                  fill="white"
                />
                {debug && (
                  <>
                    <text
                      x={timeToX(astronomicalTimes.sunrise)}
                      y="370"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333333"
                    >
                      Sunrise
                    </text>
                    <text
                      x={timeToX(astronomicalTimes.sunrise)}
                      y="355"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333333"
                    >
                      {astronomicalTimes.sunrise}
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Sunset - larger filled circle */}
            {astronomicalTimes.sunset && !isNaN(timeToX(astronomicalTimes.sunset)) && (
              <g>
                <circle
                  cx={timeToX(astronomicalTimes.sunset)}
                  cy="400"
                  r="24"
                  stroke="#333333"
                  strokeWidth="1"
                  fill="#333333"
                />
                {debug && (
                  <>
                    <text
                      x={timeToX(astronomicalTimes.sunset)}
                      y="370"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333333"
                    >
                      Sunset
                    </text>
                    <text
                      x={timeToX(astronomicalTimes.sunset)}
                      y="355"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333333"
                    >
                      {astronomicalTimes.sunset}
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Last light (dusk) - open circle */}
            {astronomicalTimes.lastLight && !isNaN(timeToX(astronomicalTimes.lastLight)) && (
              <g>
                <circle cx={timeToX(astronomicalTimes.lastLight)} cy="450" r="10" fill="white" />
                <circle
                  cx={timeToX(astronomicalTimes.lastLight)}
                  cy="450"
                  r="8"
                  stroke="#666666"
                  strokeWidth="1"
                  fill="#333333"
                />
                {debug && (
                  <>
                    <text
                      x={timeToX(astronomicalTimes.lastLight)}
                      y="430"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666666"
                    >
                      Last Light
                    </text>
                    <text
                      x={timeToX(astronomicalTimes.lastLight)}
                      y="415"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666666"
                    >
                      {astronomicalTimes.lastLight}
                    </text>
                  </>
                )}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Add debug table when debug mode is enabled */}
      {debug && renderDebugTable()}
    </div>
  )
}
