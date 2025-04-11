"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TideDataProvider } from "@/components/tide-data-provider"
import { RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchMarineData } from "@/lib/marine-data-service"
import type { WaveData } from "@/lib/wave-service"
import type { WaterTemperatureData } from "@/lib/water-temperature-service"
import { sendToVestaboard } from "../actions/vestaboard-actions"
import { toast } from "@/hooks/use-toast"

export default function VestaboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [waveData, setWaveData] = useState<WaveData | null>(null)
  const [waterTempData, setWaterTempData] = useState<WaterTemperatureData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Load marine data on component mount
  useEffect(() => {
    loadMarineData()
  }, [])

  async function loadMarineData() {
    try {
      setIsLoading(true)
      const marineData = await fetchMarineData()
      setWaveData(marineData.waveData)
      setWaterTempData(marineData.waterTempData)
    } catch (error) {
      console.error("Error loading marine data:", error)
      setWaveData(null)
      setWaterTempData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadMarineData().then(() => {
      setIsRefreshing(false)
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-normal text-slate-800">Vestaboard</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-1">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </Button>
      </div>

      <p className="text-slate-600 mb-8">This page displays information formatted for a Vestaboard display.</p>

      <TideDataProvider>
        {(tideData, isTideLoading, error) => (
          <div className="space-y-6">
            {error ? (
              <Card className="bg-red-50 border-red-100">
                <CardContent className="p-6">
                  <div className="text-red-600">
                    <h3 className="font-bold">Error loading tide data</h3>
                    <p>{error.message}</p>
                  </div>
                </CardContent>
              </Card>
            ) : isTideLoading || isLoading ? (
              <Card>
                <CardContent className="p-6 flex justify-center items-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-slate-600">Loading data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : tideData ? (
              <NextTideDisplay
                tideData={tideData}
                waveData={waveData}
                waterTempData={waterTempData}
                isSending={isSending}
                setIsSending={setIsSending}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-slate-600 text-center">No tide data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TideDataProvider>
    </div>
  )
}

interface NextTideDisplayProps {
  tideData: any
  waveData: WaveData | null
  waterTempData: WaterTemperatureData | null
  isSending: boolean
  setIsSending: (isSending: boolean) => void
}

function NextTideDisplay({ tideData, waveData, waterTempData, isSending, setIsSending }: NextTideDisplayProps) {
  // Find the next extreme tide (high or low)
  const getNextTide = () => {
    if (!tideData || !tideData.current || !tideData.current.nextExtreme) {
      return null
    }

    return tideData.current.nextExtreme
  }

  const nextTide = getNextTide()

  if (!nextTide) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600 text-center">No upcoming tide information available</p>
        </CardContent>
      </Card>
    )
  }

  // Format the time with no space between time and AM/PM
  const formatTime = (isoString) => {
    return new Date(isoString)
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(" ", "")
  }

  // Format the date
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  // Get wave direction as cardinal direction
  const getCardinalDirection = (direction: number | undefined) => {
    if (direction === undefined) return "N/A"

    // Define cardinal directions
    const directions = [
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

    // Calculate index based on direction
    const index = Math.round(direction / 22.5) % 16
    return directions[index]
  }

  // Get wave height
  const getWaveHeight = () => {
    if (!waveData || !waveData.current) return "N/A"
    return waveData.current.height.toFixed(1)
  }

  // Get water temperature in Fahrenheit
  const getWaterTemp = () => {
    if (!waterTempData) return "N/A"
    // Convert Celsius to Fahrenheit
    const tempF = (waterTempData.temperature * 9) / 5 + 32
    return Math.round(tempF)
  }

  // Get main swell direction
  const getMainSwellDirection = () => {
    if (!waveData || !waveData.current) return "N/A"
    return getCardinalDirection(waveData.current.direction)
  }

  // Format message for Vestaboard
  const getVestaboardMessage = () => {
    const tideInfo = `${nextTide.type === "high" ? "H" : "L"}${nextTide.v.toFixed(1)}@${formatTime(nextTide.t)}`
    const waveInfo = `${getMainSwellDirection()} ${getWaveHeight()}FT`
    const tempInfo = `${getWaterTemp()}F`

    // Format for Vestaboard (simple format)
    return `${tideInfo} ${waveInfo} ${tempInfo}`
  }

  // Handle sending to Vestaboard
  const handleSendToVestaboard = async () => {
    try {
      setIsSending(true)
      const message = getVestaboardMessage()
      console.log("Sending to Vestaboard:", message)

      const result = await sendToVestaboard(message)

      if (result.success) {
        toast({
          title: "Success!",
          description: "Message sent to your Vestaboard",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message to Vestaboard",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending to Vestaboard:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle>Vestaboard Display</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl font-bold">{nextTide.type === "high" ? "HIGH TIDE" : "LOW TIDE"}</div>

          <div className="text-6xl font-bold text-blue-700">{nextTide.v.toFixed(1)}ft</div>

          <div className="text-2xl">{formatTime(nextTide.t)}</div>

          <div className="text-lg text-slate-600">{formatDate(nextTide.t)}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <h3 className="text-lg font-medium mb-2">Swell Direction</h3>
              <div className="text-2xl font-bold text-blue-700">{getMainSwellDirection()}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <h3 className="text-lg font-medium mb-2">Wave Height</h3>
              <div className="text-2xl font-bold text-blue-700">{getWaveHeight()}ft</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <h3 className="text-lg font-medium mb-2">Water Temp</h3>
              <div className="text-2xl font-bold text-blue-700">{getWaterTemp()}°F</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200 w-full max-w-md">
            <h3 className="text-lg font-medium mb-2">Vestaboard Format:</h3>
            <div className="font-mono bg-slate-100 p-3 rounded text-center overflow-x-auto">
              {getVestaboardMessage()}
            </div>
          </div>

          <Button
            onClick={handleSendToVestaboard}
            disabled={isSending}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isSending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to Vestaboard
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
