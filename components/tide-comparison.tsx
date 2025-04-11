"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TideComparisonProps {
  predictedData: any
  actualData: any
  date: Date
}

export function TideComparison({ predictedData, actualData, date }: TideComparisonProps) {
  const [showActual, setShowActual] = useState(true)
  const [showPredicted, setShowPredicted] = useState(true)

  // Process the actual water level data
  const processActualData = () => {
    if (!actualData || !actualData.data || !Array.isArray(actualData.data)) {
      return []
    }

    return actualData.data.map((point: any) => ({
      time: new Date(point.t),
      height: Number.parseFloat(point.v),
    }))
  }

  // Process the predicted tide data
  const processPredictedData = () => {
    if (!predictedData || !predictedData.heights || !Array.isArray(predictedData.heights)) {
      return []
    }

    return predictedData.heights.map((point: any) => ({
      time: new Date(point.t),
      height: point.v,
    }))
  }

  const actualPoints = processActualData()
  const predictedPoints = processPredictedData()

  // Find min and max values for scaling
  const allHeights = [...actualPoints.map((p) => p.height), ...predictedPoints.map((p) => p.height)].filter(
    (h) => !isNaN(h),
  )

  const minHeight = Math.min(...allHeights)
  const maxHeight = Math.max(...allHeights)
  const heightRange = maxHeight - minHeight || 1

  // Scale factor determines how dramatic the amplitude appears
  // Small ranges (< 2ft) get minimal amplitude, large ranges (> 10ft) get maximum amplitude
  const scaleFactor = Math.min(Math.max(heightRange / 10, 0.2), 1.5)

  // SVG dimensions
  const width = 800
  const height = 400
  const padding = 40

  // Calculate x and y positions
  const getX = (time: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const totalMs = endOfDay.getTime() - startOfDay.getTime()
    const timeMs = time.getTime() - startOfDay.getTime()

    return padding + (timeMs / totalMs) * (width - 2 * padding)
  }

  const getY = (h: number) => {
    const normalizedHeight = (h - minHeight) / heightRange
    return height - padding - normalizedHeight * (height - 2 * padding) * scaleFactor
  }

  // Create SVG paths
  const createPath = (points: any[]) => {
    if (points.length === 0) return ""

    // Sort points by time
    const sortedPoints = [...points].sort((a, b) => a.time.getTime() - b.time.getTime())

    let path = `M ${getX(sortedPoints[0].time)},${getY(sortedPoints[0].height)}`

    for (let i = 1; i < sortedPoints.length; i++) {
      path += ` L ${getX(sortedPoints[i].time)},${getY(sortedPoints[i].height)}`
    }

    return path
  }

  const actualPath = createPath(actualPoints)
  const predictedPath = createPath(predictedPoints)

  // Calculate error metrics if both datasets are available
  const calculateErrorMetrics = () => {
    if (actualPoints.length === 0 || predictedPoints.length === 0) {
      return null
    }

    // Find matching time points (or closest)
    const matchedPoints = []

    for (const actual of actualPoints) {
      // Find the closest predicted point in time
      let closestPredicted = null
      let minTimeDiff = Number.POSITIVE_INFINITY

      for (const predicted of predictedPoints) {
        const timeDiff = Math.abs(actual.time.getTime() - predicted.time.getTime())
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          closestPredicted = predicted
        }
      }

      // Only include if the time difference is less than 15 minutes
      if (closestPredicted && minTimeDiff < 15 * 60 * 1000) {
        matchedPoints.push({
          time: actual.time,
          actualHeight: actual.height,
          predictedHeight: closestPredicted.height,
          error: actual.height - closestPredicted.height,
        })
      }
    }

    if (matchedPoints.length === 0) {
      return null
    }

    // Calculate error metrics
    const errors = matchedPoints.map((p) => p.error)
    const absErrors = errors.map((e) => Math.abs(e))

    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length
    const meanAbsError = absErrors.reduce((sum, e) => sum + e, 0) / absErrors.length
    const maxError = Math.max(...absErrors)

    return {
      meanError: meanError.toFixed(2),
      meanAbsError: meanAbsError.toFixed(2),
      maxError: maxError.toFixed(2),
      sampleCount: matchedPoints.length,
    }
  }

  const errorMetrics = calculateErrorMetrics()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Tide Prediction vs. Actual Measurements</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Switch id="show-predicted" checked={showPredicted} onCheckedChange={setShowPredicted} />
              <Label htmlFor="show-predicted" className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
                Predicted
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="show-actual" checked={showActual} onCheckedChange={setShowActual} />
              <Label htmlFor="show-actual" className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                Actual
              </Label>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actualPoints.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No actual measurement data available for this date.</p>
            <p className="text-sm mt-2">Try selecting a more recent date.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
                {/* X-axis */}
                <line
                  x1={padding}
                  y1={height - padding}
                  x2={width - padding}
                  y2={height - padding}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />

                {/* Y-axis */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" strokeWidth="1" />

                {/* X-axis labels (hours) */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const hour = i * 2
                  const time = new Date(date)
                  time.setHours(hour, 0, 0, 0)

                  return (
                    <g key={`hour-${hour}`}>
                      <line
                        x1={getX(time)}
                        y1={height - padding}
                        x2={getX(time)}
                        y2={height - padding + 5}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      <text x={getX(time)} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#64748b">
                        {hour.toString().padStart(2, "0")}:00
                      </text>
                    </g>
                  )
                })}

                {/* Y-axis labels (heights) */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const heightValue = minHeight + (i / 4) * heightRange

                  return (
                    <g key={`height-${i}`}>
                      <line
                        x1={padding - 5}
                        y1={getY(heightValue)}
                        x2={padding}
                        y2={getY(heightValue)}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      <text x={padding - 10} y={getY(heightValue) + 4} textAnchor="end" fontSize="12" fill="#64748b">
                        {heightValue.toFixed(1)}ft
                      </text>
                    </g>
                  )
                })}

                {/* Grid lines */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const hour = i * 2
                  const time = new Date(date)
                  time.setHours(hour, 0, 0, 0)

                  return (
                    <line
                      key={`grid-x-${hour}`}
                      x1={getX(time)}
                      y1={padding}
                      x2={getX(time)}
                      y2={height - padding}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  )
                })}

                {Array.from({ length: 5 }).map((_, i) => {
                  const heightValue = minHeight + (i / 4) * heightRange

                  return (
                    <line
                      key={`grid-y-${i}`}
                      x1={padding}
                      y1={getY(heightValue)}
                      x2={width - padding}
                      y2={getY(heightValue)}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  )
                })}

                {/* Predicted tide curve */}
                {showPredicted && predictedPath && (
                  <path d={predictedPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                )}

                {/* Actual tide curve */}
                {showActual && actualPath && <path d={actualPath} fill="none" stroke="#22c55e" strokeWidth="2" />}
              </svg>
            </div>

            {errorMetrics && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-800 mb-2">Prediction Accuracy</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Mean Error</p>
                    <p className="font-medium">{errorMetrics.meanError} ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Mean Absolute Error</p>
                    <p className="font-medium">{errorMetrics.meanAbsError} ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Maximum Error</p>
                    <p className="font-medium">{errorMetrics.maxError} ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sample Points</p>
                    <p className="font-medium">{errorMetrics.sampleCount}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Note: Positive mean error indicates actual tide levels were higher than predicted.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
