import type { TideData } from "@/lib/tide-service"
import { ArrowDown, ArrowUp } from "lucide-react"

interface TideListProps {
  tideData: TideData
}

export function TideList({ tideData }: TideListProps) {
  // Sort extremes by time
  const sortedExtremes = [...tideData.extremes].sort((a, b) => a.dt - b.dt)

  return (
    <div className="space-y-4">
      {sortedExtremes.length === 0 ? (
        <p className="text-slate-500">No tide data available</p>
      ) : (
        <ul className="space-y-3">
          {sortedExtremes.map((tide, index) => (
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
                  <p className="text-sm text-slate-500">
                    {new Date(tide.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${tide.type === "high" ? "text-blue-600" : "text-orange-600"}`}>
                  {tide.height.toFixed(2)}m
                </p>
                <p className="text-xs text-slate-500">{(tide.height * 3.28084).toFixed(2)}ft</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
