"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { fetchTidePredictions, getCurrentTide, type TideData, isToday } from "@/lib/noaa-tide-service"

interface TideDataProviderProps {
  children: (tideData: TideData | null, isLoading: boolean, error: Error | null) => React.ReactNode
}

export function TideDataProvider({ children }: TideDataProviderProps) {
  const [tideData, setTideData] = useState<TideData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTideData() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching tide predictions...")
        // Fetch tide predictions for today and tomorrow
        const predictions = await fetchTidePredictions()

        // Only update state if component is still mounted
        if (!isMounted) return

        console.log(`Received ${predictions.length} tide predictions`)
        console.log(`Today's predictions: ${predictions.filter((p) => isToday(p.t)).length}`)

        // Get current tide information
        const currentTide = getCurrentTide(predictions)

        // Extract extremes (high and low tides)
        const extremes = predictions.filter((p) => p.type === "high" || p.type === "low")
        console.log(`Found ${extremes.length} tide extremes (high/low tides)`)
        console.log(`Today's extremes: ${extremes.filter((e) => isToday(e.t)).length}`)

        // Set the tide data - ensure we're only creating one dataset
        setTideData({
          heights: predictions,
          current: currentTide,
          extremes: extremes,
        })
      } catch (err) {
        console.error("Error loading tide data:", err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load tide data"))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTideData()

    return () => {
      isMounted = false
    }
  }, [])

  // Render the children with the tide data
  return <>{children(tideData, isLoading, error)}</>
}
