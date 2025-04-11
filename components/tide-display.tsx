"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { TideData } from "@/lib/noaa-tide-service"
import { ArrowDown, ArrowUp } from "lucide-react"

interface TideDisplayProps {
  tideData: TideData | null
}

export function TideDisplay({ tideData }: TideDisplayProps) {
  // Safety check
  if (!tideData || !tideData.current) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-500 text-center">No tide data available</p>
        </CardContent>
      </Card>
    )
  }

  const { height, trend, nextExtreme } = tideData.current

  // Format time for next extreme tide
  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "Unknown"
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${trend === "rising" ? "bg-blue-100" : "bg-orange-100"}`}>
              {trend === "rising" ? (
                <ArrowUp className="h-6 w-6 text-blue-600" />
              ) : (
                <ArrowDown className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800">Current Tide</h3>
              <p className="text-slate-500">{trend === "rising" ? "Rising" : "Falling"}</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-4xl font-bold text-slate-800">{height.toFixed(1)}ft</div>
            <p className="text-slate-500">
              {nextExtreme
                ? `Next ${
                    nextExtreme.type === "high" ? "High" : "Low"
                  } Tide: ${formatTime(nextExtreme.t)} (${nextExtreme.v.toFixed(1)}ft)`
                : "No upcoming extreme tide data"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
