"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLocationByName } from "@/lib/stormglass-service"
import { toast } from "@/hooks/use-toast"

export default function LocationSearchForm() {
  const [location, setLocation] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get coordinates for the location
      const locationData = await getLocationByName(location)

      if (!locationData) {
        toast({
          title: "Location not found",
          description: "We couldn't find that location. Please try another search term.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Navigate to the forecast page with the coordinates and date
      router.push(
        `/forecast?lat=${locationData.lat}&lng=${locationData.lng}&date=${date}&name=${encodeURIComponent(locationData.displayName)}`,
      )
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: "There was an error searching for that location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Surf Location</Label>
        <Input
          id="location"
          placeholder="Enter beach, surf spot, or city name"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          max={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">Stormglass provides forecasts up to 10 days ahead</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Get Forecast
          </>
        )}
      </Button>
    </form>
  )
}
