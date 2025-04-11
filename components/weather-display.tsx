import type { WeatherData } from "@/lib/weather-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Sun, Thermometer, Wind } from "lucide-react"

interface WeatherDisplayProps {
  weatherData: WeatherData
}

export function WeatherDisplay({ weatherData }: WeatherDisplayProps) {
  const { current } = weatherData

  // Helper function to get weather icon
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "01d": <Sun className="h-8 w-8 text-yellow-500" />,
      "01n": <Sun className="h-8 w-8 text-yellow-400" />,
      "02d": <Cloud className="h-8 w-8 text-gray-400" />,
      "02n": <Cloud className="h-8 w-8 text-gray-400" />,
      "03d": <Cloud className="h-8 w-8 text-gray-400" />,
      "03n": <Cloud className="h-8 w-8 text-gray-400" />,
      "04d": <Cloud className="h-8 w-8 text-gray-500" />,
      "04n": <Cloud className="h-8 w-8 text-gray-500" />,
      "09d": <Droplets className="h-8 w-8 text-blue-400" />,
      "09n": <Droplets className="h-8 w-8 text-blue-400" />,
      "10d": <Droplets className="h-8 w-8 text-blue-500" />,
      "10n": <Droplets className="h-8 w-8 text-blue-500" />,
      // Add more mappings as needed
    }

    return iconMap[iconCode] || <Sun className="h-8 w-8 text-yellow-500" />
  }

  // Helper function to get wind direction
  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {current.weather[0] && getWeatherIcon(current.weather[0].icon)}
          <span>Current Weather</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{Math.round(current.temp)}°C</div>
              <div className="text-slate-500">Feels like {Math.round(current.feels_like)}°C</div>
            </div>

            <div className="text-xl capitalize">{current.weather[0]?.description || "Clear sky"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-sm text-slate-500">Humidity</div>
                <div className="font-medium">{current.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-slate-500">Wind</div>
                <div className="font-medium">
                  {Math.round(current.wind_speed * 3.6)} km/h {getWindDirection(current.wind_deg)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-slate-500">UV Index</div>
                <div className="font-medium">{current.uvi.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
