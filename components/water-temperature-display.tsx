import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"
import { Thermometer } from "lucide-react"

interface WaterTemperatureDisplayProps {
  waterTempData: WaterTemperatureData | null
}

export function WaterTemperatureDisplay({ waterTempData }: WaterTemperatureDisplayProps) {
  if (!waterTempData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            <span>Water Temperature</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center">No water temperature data available</p>
        </CardContent>
      </Card>
    )
  }

  // Temperature is already in Fahrenheit from the adapter
  const tempF = waterTempData.temperature
  // Convert Fahrenheit to Celsius for secondary display
  const tempC = ((tempF - 32) * 5) / 9

  // Format the timestamp
  const formattedTime = new Date(waterTempData.timestamp * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-600" />
          <span>Water Temperature</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-700">{tempF.toFixed(1)}°F</span>
            <span className="text-lg text-slate-600">({tempC.toFixed(1)}°C)</span>
          </div>
          <div className="text-sm text-slate-500 mt-2 md:mt-0">
            <p>Last updated: {formattedTime}</p>
            <p>
              Source: {waterTempData.source} Station {waterTempData.station}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
