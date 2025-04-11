import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, Waves } from "lucide-react"

interface WaveForecastCardProps {
  time: string
  waveHeight?: number
  waveDirection?: number
  wavePeriod?: number
  swellHeight?: number
  swellDirection?: number
  swellPeriod?: number
  waterTemperature?: number
  windSpeed?: number
  windDirection?: number
}

export default function WaveForecastCard({
  time,
  waveHeight,
  waveDirection,
  wavePeriod,
  swellHeight,
  swellDirection,
  swellPeriod,
  waterTemperature,
  windSpeed,
  windDirection,
}: WaveForecastCardProps) {
  // Format time
  const formattedTime = new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Helper function to convert degrees to cardinal direction
  const degreesToCardinal = (degrees?: number) => {
    if (degrees === undefined) return "N/A"

    const cardinals = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round(degrees / 22.5) % 16
    return cardinals[index]
  }

  // Helper function to convert meters to feet for display
  const metersToFeet = (meters?: number) => {
    if (meters === undefined) return "N/A"
    return (meters * 3.28084).toFixed(1)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{formattedTime}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Wave</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">
              {waveHeight !== undefined ? `${metersToFeet(waveHeight)}ft` : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              {wavePeriod !== undefined ? `${wavePeriod.toFixed(1)}s` : "N/A"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-blue-500" style={{ transform: `rotate(${waveDirection || 0}deg)` }} />
            <span className="text-sm font-medium">Direction</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">{degreesToCardinal(waveDirection)}</div>
            <div className="text-xs text-muted-foreground">
              {waveDirection !== undefined ? `${Math.round(waveDirection)}°` : "N/A"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground">Swell</div>
            <div className="font-medium">{swellHeight !== undefined ? `${metersToFeet(swellHeight)}ft` : "N/A"}</div>
            <div className="text-xs">{swellPeriod !== undefined ? `${swellPeriod.toFixed(1)}s` : "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Water Temp</div>
            <div className="font-medium">
              {waterTemperature !== undefined ? `${waterTemperature.toFixed(1)}°F` : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Wind</div>
            <div className="font-medium">{windSpeed !== undefined ? `${windSpeed.toFixed(1)} m/s` : "N/A"}</div>
            <div className="text-xs">{degreesToCardinal(windDirection)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
