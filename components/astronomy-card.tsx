import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sunrise, Sunset } from "lucide-react"

interface AstronomyCardProps {
  sunrise?: string
  sunset?: string
  moonrise?: string
  moonset?: string
  moonPhase?: number
}

export default function AstronomyCard({ sunrise, sunset, moonrise, moonset, moonPhase }: AstronomyCardProps) {
  // Format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "N/A"
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get moon phase description
  const getMoonPhaseDescription = (phase?: number) => {
    if (phase === undefined) return "Unknown"

    if (phase === 0 || phase === 1) return "New Moon"
    if (phase < 0.25) return "Waxing Crescent"
    if (phase === 0.25) return "First Quarter"
    if (phase < 0.5) return "Waxing Gibbous"
    if (phase === 0.5) return "Full Moon"
    if (phase < 0.75) return "Waning Gibbous"
    if (phase === 0.75) return "Last Quarter"
    return "Waning Crescent"
  }

  // Render moon phase icon
  const renderMoonPhase = () => {
    if (moonPhase === undefined) return null

    // SVG dimensions
    const size = 80
    const radius = size / 2
    const center = size / 2

    if (moonPhase === 0 || moonPhase === 1) {
      // New moon
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
          <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      )
    } else if (moonPhase === 0.5) {
      // Full moon
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
          <circle cx={center} cy={center} r={radius} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      )
    } else {
      // Calculate the x-offset of the terminator curve based on phase
      const isWaxing = moonPhase < 0.5
      const isGibbous = (moonPhase > 0.25 && moonPhase < 0.5) || (moonPhase > 0.5 && moonPhase < 0.75)

      let xOffset
      if (isWaxing) {
        // For waxing phases
        xOffset = isGibbous ? center + radius * (moonPhase * 2 - 0.5) * 2 : center - radius * (0.5 - moonPhase * 2) * 2
      } else {
        // For waning phases
        xOffset = isGibbous
          ? center - radius * (1 - (moonPhase - 0.5) * 2) * 2
          : center + radius * ((moonPhase - 0.75) * 4) * 2
      }

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
          {/* Base circle (dark side of moon) */}
          <circle cx={center} cy={center} r={radius} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />

          <clipPath id="moonClip">
            <circle cx={center} cy={center} r={radius} />
          </clipPath>

          <g clipPath="url(#moonClip)">
            {/* For waxing phases, the light comes from the right */}
            {/* For waning phases, the light comes from the left */}
            <ellipse cx={xOffset} cy={center} rx={radius * 1.05} ry={radius} fill="#f1f5f9" />
          </g>
        </svg>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Astronomy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sunrise className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">Sunrise</span>
            </div>
            <div className="text-lg">{formatTime(sunrise)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sunset className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Sunset</span>
            </div>
            <div className="text-lg">{formatTime(sunset)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium">Moonrise</span>
            </div>
            <div className="text-lg">{formatTime(moonrise)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-medium">Moonset</span>
            </div>
            <div className="text-lg">{formatTime(moonset)}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-center mb-3">
            <span className="text-sm font-medium">Moon Phase</span>
            <div className="text-lg">{getMoonPhaseDescription(moonPhase)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {moonPhase !== undefined ? `${(moonPhase * 100).toFixed(0)}% of lunar cycle` : ""}
            </div>
          </div>
          {renderMoonPhase()}
          <div className="text-xs text-center text-muted-foreground mt-4">
            Note: Astronomy data is calculated and may not be exact
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
