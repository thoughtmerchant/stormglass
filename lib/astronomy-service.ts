// Calculate astronomy data based on date and location
export function calculateAstronomyData(
  lat: number,
  lng: number,
  date: Date,
): {
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  moonPhase: number
} {
  // This is a simplified calculation - in a real app, you would use a proper astronomy library

  // Day of year (0-365)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  // Latitude adjustment - days are longer in summer for northern latitudes, shorter for southern
  const latitudeAdjustment =
    lat > 0
      ? Math.sin(((dayOfYear - 172) / 365) * Math.PI * 2) * (lat / 90) * 3 // Northern hemisphere
      : Math.sin(((dayOfYear - 355) / 365) * Math.PI * 2) * (lat / -90) * 3 // Southern hemisphere

  // Base sunrise/sunset times (approximate)
  const baseSunrise = 6 // 6:00 AM
  const baseSunset = 18 // 6:00 PM

  // Adjust for day of year - days are longer in summer, shorter in winter
  const dayLengthAdjustment = Math.sin(((dayOfYear - 172) / 365) * Math.PI * 2) * 2 // ±2 hours

  // Calculate sunrise and sunset
  const sunriseHour = baseSunrise - dayLengthAdjustment / 2 - latitudeAdjustment / 2
  const sunsetHour = baseSunset + dayLengthAdjustment / 2 + latitudeAdjustment / 2

  // Calculate moonrise and moonset (simplified - in reality, these vary significantly)
  // For this mock, we'll offset from sunrise/sunset by a phase-dependent amount
  const moonPhase = (dayOfYear % 29.5) / 29.5 // 0 to 1 representing new moon to new moon
  const moonOffset = moonPhase * 24 // Hours offset based on moon phase

  const moonriseHour = (sunriseHour + moonOffset) % 24
  const moonsetHour = (sunsetHour + moonOffset) % 24

  // Create date objects for each event
  const sunrise = new Date(date)
  sunrise.setHours(Math.floor(sunriseHour), Math.round((sunriseHour % 1) * 60), 0, 0)

  const sunset = new Date(date)
  sunset.setHours(Math.floor(sunsetHour), Math.round((sunsetHour % 1) * 60), 0, 0)

  const moonrise = new Date(date)
  moonrise.setHours(Math.floor(moonriseHour), Math.round((moonriseHour % 1) * 60), 0, 0)

  const moonset = new Date(date)
  moonset.setHours(Math.floor(moonsetHour), Math.round((moonsetHour % 1) * 60), 0, 0)

  return {
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    moonrise: moonrise.toISOString(),
    moonset: moonset.toISOString(),
    moonPhase: moonPhase,
  }
}
