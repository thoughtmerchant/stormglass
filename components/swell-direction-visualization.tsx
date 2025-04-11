"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WaveData, WavePoint } from "@/lib/wave-service"

interface SwellDirectionVisualizationProps {
  waveData: WaveData | null
}

export function SwellDirectionVisualization({ waveData }: SwellDirectionVisualizationProps) {
  if (!waveData || !waveData.forecast || waveData.forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Primary Swell Directions</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <p className="text-slate-500">No swell data available</p>
        </CardContent>
      </Card>
    )
  }

  // Process the wave data to find the 3 biggest swells
  const getBiggestSwells = () => {
    // Combine current and forecast data
    const allWavePoints = [waveData.current, ...waveData.forecast]

    // Group by direction (rounded to nearest 5 degrees)
    const swellsByDirection: Record<string, WavePoint[]> = {}

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

  const biggestSwells = getBiggestSwells()

  // SVG dimensions
  const size = 300
  const center = size / 2
  const maxRadius = size / 2 - 30 // Leave margin for labels

  // Colors for the different swells
  const colors = ["#3b82f6", "#f97316", "#8b5cf6"]

  // Create the radial lines
  const createRadialLines = () => {
    return biggestSwells.map((swell, index) => {
      // Convert to radians and adjust for SVG coordinate system
      const angleRad = (Math.PI * (90 - swell.direction)) / 180

      // Calculate line length based on wave height
      // Scale the length based on the biggest swell
      const maxHeight = biggestSwells[0].height
      const scaleFactor = swell.height / maxHeight
      const length = maxRadius * scaleFactor

      // Calculate end point
      const endX = center + length * Math.cos(angleRad)
      const endY = center - length * Math.sin(angleRad)

      // Calculate label position (slightly beyond the end of the line)
      const labelOffset = 15
      const labelX = center + (length + labelOffset) * Math.cos(angleRad)
      const labelY = center - (length + labelOffset) * Math.sin(angleRad)

      // Adjust text anchor based on position in the circle
      const quadrant = Math.floor((swell.direction % 360) / 90)
      const textAnchor =
        quadrant === 0 || quadrant === 3 ? "start" : quadrant === 1 || quadrant === 2 ? "end" : "middle"

      return (
        <g key={index}>
          {/* Line */}
          <line
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke={colors[index]}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Direction marker (arrow) */}
          <circle cx={endX} cy={endY} r="4" fill={colors[index]} />

          {/* Label */}
          <text
            x={labelX}
            y={labelY}
            fill={colors[index]}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontWeight="500"
            fontSize="12"
          >
            {swell.directionText} {swell.height.toFixed(1)}ft
          </text>

          {/* Period label */}
          <text
            x={labelX}
            y={labelY + 16}
            fill={colors[index]}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize="10"
            opacity="0.8"
          >
            {swell.period.toFixed(0)}s period
          </text>
        </g>
      )
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Swell Directions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Compass directions */}
            <text x={center} y={20} textAnchor="middle" fontSize="12" fill="#64748b">
              N
            </text>
            <text x={size - 20} y={center + 4} textAnchor="middle" fontSize="12" fill="#64748b">
              E
            </text>
            <text x={center} y={size - 10} textAnchor="middle" fontSize="12" fill="#64748b">
              S
            </text>
            <text x={20} y={center + 4} textAnchor="middle" fontSize="12" fill="#64748b">
              W
            </text>

            {/* Center point */}
            <circle cx={center} cy={center} r="3" fill="#64748b" />

            {/* Radial lines */}
            {createRadialLines()}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-4 gap-6">
          {biggestSwells.map((swell, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }}></div>
              <span className="text-sm text-slate-600">
                {swell.directionText} ({swell.direction}°)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
