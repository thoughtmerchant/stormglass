import type { WeatherData } from "@/lib/weather-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Sun } from "lucide-react"
import type { JSX } from "react"

interface WeatherForecastProps {
  weatherData: WeatherData
}

export function WeatherForecast({ weatherData }: WeatherForecastProps) {
  const { hourly } = weatherData

  // Get the next 8 hours of forecast
  const nextHours = hourly.slice(0, 8)

  // Helper function to get weather icon
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "01d": <Sun className="h-5 w-5 text-yellow-500" />,
      "01n": <Sun className="h-5 w-5 text-yellow-400" />,
      "02d": <Cloud className="h-5 w-5 text-gray-400" />,
      "02n": <Cloud className="h-5 w-5 text-gray-400" />,
      "03d": <Cloud className="h-5 w-5 text-gray-400" />,
      "03n": <Cloud className="h-5 w-5 text-gray-400" />,
      "04d": <Cloud className="h-5 w-5 text-gray-500" />,
      "04n": <Cloud className="h-5 w-5 text-gray-500" />,
      "09d": <Droplets className="h-5 w-5 text-blue-400" />,
      "09n": <Droplets className="h-5 w-5 text-blue-400" />,
      "10d": <Droplets className="h-5 w-5 text-blue-500" />,
      "10n": <Droplets className="h-5 w-5 text-blue-500" />,
      // Add more mappings as needed
    }

    return iconMap[iconCode] || <Sun className="h-5 w-5 text-yellow-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
          {nextHours.map((hour, index) => (
            <div key={index} className="flex flex-col items-center p-2">
              <div className="text-sm text-slate-500">{new Date(hour.dt * 1000).getHours()}:00</div>
              <div className="my-2">{hour.weather[0] && getWeatherIcon(hour.weather[0].icon)}</div>
              <div className="font-medium">{Math.round(hour.temp)}°C</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
