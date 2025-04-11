"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StormglassTideResponse } from "@/lib/stormglass-service"

interface TideChartProps {
  tideData: StormglassTideResponse
  date: string
}

export default function TideChart({ tideData, date }: TideChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !tideData || !tideData.data || tideData.data.length === 0) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Get min and max tide heights
    const heights = tideData.data.map((point) => point.height)
    const minHeight = Math.min(...heights)
    const maxHeight = Math.max(...heights)
    const heightRange = maxHeight - minHeight || 1 // Prevent division by zero

    // Scale factor determines how dramatic the amplitude appears
    // Small ranges (< 2ft) get minimal amplitude, large ranges (> 10ft) get maximum amplitude
    const scaleFactor = Math.min(Math.max(heightRange / 10, 0.2), 1.5)
    // Adjust the visual height range based on the actual tide range
    const visualHeightRange = heightRange * scaleFactor

    // Get start and end times for the selected date
    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)

    // Y-axis
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw X-axis labels (hours)
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    for (let hour = 0; hour <= 24; hour += 3) {
      const x = padding + ((width - 2 * padding) * hour) / 24
      ctx.fillText(`${hour}:00`, x, height - padding + 20)

      // Draw grid line
      ctx.beginPath()
      ctx.strokeStyle = "#e2e8f0"
      ctx.setLineDash([2, 2])
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw Y-axis labels (tide heights)
    ctx.textAlign = "right"
    const numYLabels = 5

    for (let i = 0; i < numYLabels; i++) {
      const heightValue = minHeight + (i / (numYLabels - 1)) * heightRange
      const y = height - padding - ((height - 2 * padding) * (heightValue - minHeight)) / heightRange

      ctx.fillText(`${heightValue.toFixed(1)}m`, padding - 10, y + 4)

      // Draw grid line
      ctx.beginPath()
      ctx.strokeStyle = "#e2e8f0"
      ctx.setLineDash([2, 2])
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Filter tide data for the selected day
    const dayTideData = tideData.data.filter((point) => {
      const pointTime = new Date(point.time)
      return pointTime >= startOfDay && pointTime <= endOfDay
    })

    // If we have no data points for this day, draw a simple sine wave as placeholder
    if (dayTideData.length === 0) {
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2

      for (let x = padding; x <= width - padding; x++) {
        const progress = (x - padding) / (width - 2 * padding)
        const y = height - padding - ((height - 2 * padding) / 2) * (1 + Math.sin(progress * Math.PI * 2) * 0.4)

        if (x === padding) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    } else {
      // Draw tide curve with actual data
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2

      let firstPoint = true

      // Sort points by time
      const sortedPoints = [...dayTideData].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

      sortedPoints.forEach((point) => {
        const pointTime = new Date(point.time)

        // Calculate position
        const minutesSinceMidnight = pointTime.getHours() * 60 + pointTime.getMinutes()
        const x = padding + ((width - 2 * padding) * minutesSinceMidnight) / (24 * 60)
        const y = height - padding - (((height - 2 * padding) * (point.height - minHeight)) / heightRange) * scaleFactor

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    // Draw high and low tide markers
    tideData.data.forEach((point) => {
      if (!point.type) return

      const pointTime = new Date(point.time)

      // Skip points outside the selected day
      if (pointTime < startOfDay || pointTime > endOfDay) {
        return
      }

      // Calculate position
      const minutesSinceMidnight = pointTime.getHours() * 60 + pointTime.getMinutes()
      const x = padding + ((width - 2 * padding) * minutesSinceMidnight) / (24 * 60)
      const y = height - padding - ((height - 2 * padding) * (point.height - minHeight)) / heightRange

      // Draw marker
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = point.type === "high" ? "#3b82f6" : "#f97316"
      ctx.fill()

      // Draw label
      ctx.fillStyle = point.type === "high" ? "#3b82f6" : "#f97316"
      ctx.textAlign = "center"
      ctx.fillText(`${point.type === "high" ? "High" : "Low"}: ${point.height.toFixed(1)}m`, x, y - 15)
      ctx.fillText(`${pointTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, x, y - 30)
    })
  }, [tideData, date])

  if (!tideData || !tideData.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tide Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No tide data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tide Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto"></canvas>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Source: {tideData.meta.station?.name || "Stormglass.io"}</p>
          {tideData.meta.station?.distance && <p>Station distance: {tideData.meta.station.distance.toFixed(1)} km</p>}
        </div>
      </CardContent>
    </Card>
  )
}
