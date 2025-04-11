import type { TideData } from "@/lib/tide-service"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Clock } from "lucide-react"

interface CurrentTideProps {
  tideData: TideData
}

export function CurrentTide({ tideData }: CurrentTideProps) {
  // Get current time
  const now = Math.floor(Date.now() / 1000)

  // Simplified function to get current tide height
  const getCurrentTideHeight = () => {
    if (!tideData.heights || tideData.heights.length === 0) {
      return 1.0 // Default fallback value
    }

    // Find the closest data point to current time
    let closestPoint = tideData.heights[0]
    let minTimeDiff = Math.abs(now - closestPoint.dt)

    for (let i = 1; i < tideData.heights.length; i++) {
      const timeDiff = Math.abs(now - tideData.heights[i].dt)
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff
        closestPoint = tideData.heights[i]
      }
    }

    return closestPoint.height
  }

  // Simplified function to determine tide trend
  const getTideTrend = () => {
    if (!tideData.heights || tideData.heights.length < 2) {
      return "rising" // Default fallback
    }

    // Find the closest data point to current time
    let closestIndex = 0
    let minTimeDiff = Math.abs(now - tideData.heights[0].dt)

    for (let i = 1; i < tideData.heights.length; i++) {
      const timeDiff = Math.abs(now - tideData.heights[i].dt)
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff
        closestIndex = i
      }
    }

    // Check if we're at the end of the array
    if (closestIndex >= tideData.heights.length - 1) {
      return "falling" // Default at end of data
    }

    // Compare with next point to determine trend
    return tideData.heights[closestIndex + 1].height > tideData.heights[closestIndex].height ? "rising" : "falling"
  }

  // Simplified function to get next extreme tide
  const getNextExtremeTide = () => {
    if (!tideData.extremes || tideData.extremes.length === 0) {
      return null
    }

    // Find the next extreme tide after current time
    const futureExtremes = tideData.extremes.filter((extreme) => extreme.dt > now)

    if (futureExtremes.length === 0) {
      return null
    }

    // Return the closest future extreme
    return futureExtremes.reduce((closest, current) => (current.dt < closest.dt ? current : closest))
  }

  const currentHeight = getCurrentTideHeight()
  const tideTrend = getTideTrend()
  const nextExtreme = getNextExtremeTide()

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-blue-100">Current Tide</h2>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{currentHeight.toFixed(2)}m</span>
              <span className="text-xl mb-1">({(currentHeight * 3.28084).toFixed(2)}ft)</span>
            </div>
            <Badge variant="outline" className="bg-white/10 text-white border-none">
              {tideTrend === "rising" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {tideTrend === "rising" ? "Rising" : "Falling"}
            </Badge>
          </div>

          {nextExtreme && (
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-blue-100">
                Next {nextExtreme.type === "high" ? "High" : "Low"} Tide
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{nextExtreme.height.toFixed(2)}m</span>
                {nextExtreme.type === "high" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
              </div>
              <div className="flex items-center gap-1 text-blue-100">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(nextExtreme.dt * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-blue-100">Location</h2>
            <p className="text-xl font-semibold">Santa Monica Bay</p>
            <p className="text-blue-100">California, USA</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
