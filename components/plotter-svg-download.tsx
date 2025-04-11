"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { generatePlotterSvg } from "@/lib/plotter-svg-generator"
import type { TideData } from "@/lib/noaa-tide-service"
import type { WaveData } from "@/lib/wave-service"
import type { WaterTemperatureData } from "@/components/ocean-data-visualization"

interface PlotterSvgDownloadProps {
  tideData: TideData | null
  waveData: WaveData | null
  waterTempData: WaterTemperatureData | null
  astronomicalTimes: {
    firstLight: string
    sunrise: string
    sunset: string
    lastLight: string
  }
}

export function PlotterSvgDownload({ tideData, waveData, waterTempData, astronomicalTimes }: PlotterSvgDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = () => {
    setIsGenerating(true)

    try {
      // Generate the SVG content
      const svgContent = generatePlotterSvg({
        tideData,
        waveData,
        waterTempData,
        astronomicalTimes,
        penWidth: 2, // 2mm pen width
        font: "Arial", // Default font
        singleStrokeFontUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/full_single_stroke_characters-IjkjjxkcSWlEtfgxQ8TCVBtFoqyNJm.svg", // URL to the single-stroke font
      })

      // Format the current date for the filename
      const now = new Date()
      const formattedDate = now.toISOString().split("T")[0] // Format as YYYY-MM-DD

      // Create a filename with location and date
      const filename = `venice-california-${formattedDate}.svg`

      // Create a Blob from the SVG content
      const blob = new Blob([svgContent], { type: "image/svg+xml" })

      // Create a download URL
      const url = URL.createObjectURL(blob)

      // Create a temporary link element and trigger the download
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating SVG:", error)
      alert("Failed to generate SVG. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      <span>{isGenerating ? "Generating..." : "Download Plotter SVG"}</span>
    </Button>
  )
}
