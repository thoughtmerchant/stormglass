import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WaveData } from "@/lib/wave-service"
import { Waves } from "lucide-react"

interface WaveSummaryProps {
  waveData: WaveData | null
}

export function WaveSummary({ waveData }: WaveSummaryProps) {
  if (!waveData || !waveData.current) {
    return null
  }

  // Helper function to get wave height description
  const getWaveHeightDescription = (height: number) => {
    if (height < 1.6) return "Calm"
    if (height < 3.3) return "Smooth"
    if (height < 4.9) return "Slight"
    if (height < 8.2) return "Moderate"
    if (height < 13.1) return "Rough"
    if (height < 19.7) return "Very Rough"
    if (height < 29.5) return "High"
    return "Very High"
  }

  // Helper function to get wave period description
  const getWavePeriodDescription = (period: number) => {
    if (period < 5) return "Wind Chop"
    if (period < 8) return "Wind Waves"
    if (period < 10) return "Short-Period Swell"
    if (period < 13) return "Medium-Period Swell"
    return "Long-Period Swell"
  }

  // Helper function to convert feet to meters
  const feetToMeters = (feet: number) => {
    return (feet * 0.3048).toFixed(1)
  }

  return (
    <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-cyan-600" />
          <span>Current Wave Conditions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Wave Height</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-700">{waveData.current.height.toFixed(1)}ft</span>
              <span className="text-slate-500">({feetToMeters(waveData.current.height)}m)</span>
            </div>
            <div className="text-sm font-medium text-cyan-600">{getWaveHeightDescription(waveData.current.height)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-slate-500">Wave Period</div>
            <div className="text-3xl font-bold text-cyan-700">{waveData.current.period}s</div>
            <div className="text-sm font-medium text-cyan-600">{getWavePeriodDescription(waveData.current.period)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-slate-500">Primary Direction</div>
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-700"
                style={{
                  transform: `rotate(${waveData.current.direction - 180}deg)`,
                }}
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
              <div>
                <span className="text-2xl font-bold text-cyan-700">{waveData.current.directionText}</span>
                <span className="text-sm text-slate-500 ml-2">({waveData.current.direction}°)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
