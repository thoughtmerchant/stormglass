import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Sunrise, Sunset, Moon } from "lucide-react"

interface DayTimelineProps {
  astronomicalTimes: {
    firstLight: string
    sunrise: string
    sunset: string
    lastLight: string
  }
}

export function DayTimeline({ astronomicalTimes }: DayTimelineProps) {
  // Helper function to convert time string (HH:MM) to percentage of day
  const timeToPercentage = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / 1440) * 100 // 1440 minutes in a day
  }

  // Calculate positions for each event
  const firstLightPos = timeToPercentage(astronomicalTimes.firstLight)
  const sunrisePos = timeToPercentage(astronomicalTimes.sunrise)
  const sunsetPos = timeToPercentage(astronomicalTimes.sunset)
  const lastLightPos = timeToPercentage(astronomicalTimes.lastLight)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          <span>Day Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-32 mb-6">
          {/* Timeline bar */}
          <div className="absolute top-20 left-0 right-0 h-2 bg-slate-200 rounded-full">
            {/* Day portion */}
            <div
              className="absolute h-full bg-gradient-to-r from-amber-400 to-blue-400 rounded-full"
              style={{
                left: `${sunrisePos}%`,
                width: `${sunsetPos - sunrisePos}%`,
              }}
            ></div>

            {/* Dawn portion */}
            <div
              className="absolute h-full bg-gradient-to-r from-indigo-300 to-amber-400 rounded-full"
              style={{
                left: `${firstLightPos}%`,
                width: `${sunrisePos - firstLightPos}%`,
              }}
            ></div>

            {/* Dusk portion */}
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400 to-indigo-300 rounded-full"
              style={{
                left: `${sunsetPos}%`,
                width: `${lastLightPos - sunsetPos}%`,
              }}
            ></div>
          </div>

          {/* Hour markers */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute top-22 w-px h-2 bg-slate-400" style={{ left: `${(i / 24) * 100}%` }}>
              {i % 3 === 0 && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
                  {i.toString().padStart(2, "0")}:00
                </div>
              )}
            </div>
          ))}

          {/* Event markers */}
          {/* First Light */}
          <div className="absolute top-0 transform -translate-x-1/2" style={{ left: `${firstLightPos}%` }}>
            <div className="flex flex-col items-center">
              <Sun className="h-5 w-5 text-amber-500" />
              <div className="h-14 w-px bg-amber-500 mt-1"></div>
              <div className="text-xs font-medium mt-1">First Light</div>
              <div className="text-xs text-slate-500">{astronomicalTimes.firstLight}</div>
            </div>
          </div>

          {/* Sunrise */}
          <div className="absolute top-0 transform -translate-x-1/2" style={{ left: `${sunrisePos}%` }}>
            <div className="flex flex-col items-center">
              <Sunrise className="h-5 w-5 text-orange-500" />
              <div className="h-14 w-px bg-orange-500 mt-1"></div>
              <div className="text-xs font-medium mt-1">Sunrise</div>
              <div className="text-xs text-slate-500">{astronomicalTimes.sunrise}</div>
            </div>
          </div>

          {/* Sunset - Enhanced for visibility */}
          <div className="absolute top-0 transform -translate-x-1/2 z-10" style={{ left: `${sunsetPos}%` }}>
            <div className="flex flex-col items-center">
              <Sunset className="h-6 w-6 text-blue-600" />
              <div className="h-14 w-1.5 bg-blue-500 mt-1"></div>
              <div className="bg-white px-2 py-0.5 rounded shadow-sm">
                <div className="text-sm font-bold text-black">Sunset</div>
                <div className="text-xs font-medium text-black">{astronomicalTimes.sunset}</div>
              </div>
            </div>
          </div>

          {/* Last Light */}
          <div className="absolute top-0 transform -translate-x-1/2" style={{ left: `${lastLightPos}%` }}>
            <div className="flex flex-col items-center">
              <Moon className="h-5 w-5 text-indigo-500" />
              <div className="h-14 w-px bg-indigo-500 mt-1"></div>
              <div className="text-xs font-medium mt-1">Last Light</div>
              <div className="text-xs text-slate-500">{astronomicalTimes.lastLight}</div>
            </div>
          </div>

          {/* Current time marker */}
          {(() => {
            const now = new Date()
            const hours = now.getHours()
            const minutes = now.getMinutes()
            const currentTimePercentage = ((hours * 60 + minutes) / 1440) * 100

            return (
              <div
                className="absolute top-16 transform -translate-x-1/2 z-20"
                style={{ left: `${currentTimePercentage}%` }}
              >
                <div className="h-10 w-1 bg-red-500"></div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded">
                  Now
                </div>
              </div>
            )
          })()}
        </div>

        <div className="text-xs text-slate-500 text-center">
          Night: {astronomicalTimes.lastLight} - {astronomicalTimes.firstLight} | Dawn: {astronomicalTimes.firstLight} -{" "}
          {astronomicalTimes.sunrise} | Day: {astronomicalTimes.sunrise} - {astronomicalTimes.sunset} | Dusk:{" "}
          {astronomicalTimes.sunset} - {astronomicalTimes.lastLight}
        </div>
      </CardContent>
    </Card>
  )
}
