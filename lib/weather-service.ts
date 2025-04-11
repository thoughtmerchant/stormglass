// Types for weather data
export interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    wind_deg: number
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
    uvi: number
  }
  hourly: {
    dt: number
    temp: number
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
  }[]
  daily: {
    dt: number
    temp: {
      day: number
      min: number
      max: number
    }
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
  }[]
}

// Function to get weather data for Santa Monica Bay
export async function getWeatherData(): Promise<WeatherData> {
  try {
    // Santa Monica Bay coordinates
    const lat = 34.0095
    const lng = -118.5005

    // Fetch weather data from OpenWeatherMap API
    // Note: In a real application, you would use an API key
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely&appid=YOUR_API_KEY`,
      { next: { revalidate: 3600 } }, // Revalidate every hour
    )

    if (!response.ok) {
      return getMockWeatherData()
    }

    const data = await response.json()
    return data as WeatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return getMockWeatherData()
  }
}

// Mock data in case the API call fails
function getMockWeatherData(): WeatherData {
  const now = Math.floor(Date.now() / 1000)
  const hour = 3600

  return {
    current: {
      temp: 22.5,
      feels_like: 22.8,
      humidity: 65,
      wind_speed: 3.6,
      wind_deg: 250,
      weather: [
        {
          id: 800,
          main: "Clear",
          description: "clear sky",
          icon: "01d",
        },
      ],
      uvi: 6.2,
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      dt: now + i * hour,
      temp: 22 + Math.sin((i / 24) * Math.PI * 2) * 3,
      weather: [
        {
          id: i % 3 === 0 ? 801 : 800,
          main: i % 3 === 0 ? "Clouds" : "Clear",
          description: i % 3 === 0 ? "few clouds" : "clear sky",
          icon: i % 3 === 0 ? "02d" : "01d",
        },
      ],
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      dt: now + i * 24 * hour,
      temp: {
        day: 22 + Math.sin((i / 7) * Math.PI) * 2,
        min: 18 + Math.sin((i / 7) * Math.PI) * 2,
        max: 26 + Math.sin((i / 7) * Math.PI) * 2,
      },
      weather: [
        {
          id: i % 4 === 0 ? 500 : i % 3 === 0 ? 801 : 800,
          main: i % 4 === 0 ? "Rain" : i % 3 === 0 ? "Clouds" : "Clear",
          description: i % 4 === 0 ? "light rain" : i % 3 === 0 ? "few clouds" : "clear sky",
          icon: i % 4 === 0 ? "10d" : i % 3 === 0 ? "02d" : "01d",
        },
      ],
    })),
  }
}
