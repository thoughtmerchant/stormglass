import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Sun, Thermometer, Wind } from "lucide-react"

interface WeatherCardProps {
  time: string
  airTemperature?: number
  humidity?: number
  cloudCover?: number
  precipitation?: number
  windSpeed?: number
  windDirection?: number
  visibility?: number
}

export default function WeatherCard({
  time,
  airTemperature,
  humidity,
  cloudCover,
  precipitation,
  windSpeed,
  windDirection,
  visibility,
}: WeatherCardProps) {
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

  // Get weather icon based on conditions
  const getWeatherIcon = () => {
    if (precipitation && precipitation > 0.5) {
      return <Droplets className="h-10 w-10 text-blue-500" />
    }
    if (cloudCover && cloudCover > 50) {
      return <Cloud className="h-10 w-10 text-slate-400" />
    }
    return <Sun className="h-10 w-10 text-amber-500" />
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{formattedTime}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWeatherIcon()}
            <div>
              <div className="text-2xl font-bold">
                {airTemperature !== undefined ? `${airTemperature.toFixed(1)}°C` : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {precipitation !== undefined ? `${(precipitation * 100).toFixed(1)}% precip.` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="font-medium">{humidity !== undefined ? `${(humidity * 100).toFixed(0)}%` : "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-muted-foreground">Cloud Cover</div>
              <div className="font-medium">
                {cloudCover !== undefined ? `${(cloudCover * 100).toFixed(0)}%` : "N/A"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="font-medium">{windSpeed !== undefined ? `${windSpeed.toFixed(1)} m/s` : "N/A"}</div>
              <div className="text-xs">{degreesToCardinal(windDirection)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12h20M12 2v20" />
            </svg>
            <div>
              <div className="text-xs text-muted-foreground">Visibility</div>
              <div className="font-medium">
                {visibility !== undefined ? `${(visibility / 1000).toFixed(1)} km` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
