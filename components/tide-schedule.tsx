"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { TideData } from "@/lib/noaa-tide-service"
import { ArrowDown, ArrowUp } from "lucide-react"

interface TideScheduleProps {
  tideData: TideData
}

export function TideSchedule({ tideData }: TideScheduleProps) {
  // Helper function to format time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-slate-800 mb-4">Tide Schedule</h2>
        {tideData.extremes.length > 0 ? (
          <ul className="space-y-3">
            {tideData.extremes.map((tide, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tide.type === "high" ? "bg-blue-100" : "bg-orange-100"}`}>
                    {tide.type === "high" ? (
                      <ArrowUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tide.type === "high" ? "High Tide" : "Low Tide"}</p>
                    <p className="text-sm text-slate-500">{formatTime(tide.t)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${tide.type === "high" ? "text-blue-600" : "text-orange-600"}`}>
                    {tide.v.toFixed(1)}ft
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No tide data available</p>
        )}
      </CardContent>
    </Card>
  )
}
