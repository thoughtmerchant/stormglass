// lib/marine-data-service.ts
"use server"

import { getWaveData } from "@/lib/wave-service"
import { getReliableWaterTemperature } from "@/lib/water-temperature-service"

export async function fetchMarineData() {
  try {
    const waveData = await getWaveData()
    const waterTempData = await getReliableWaterTemperature()

    return {
      waveData,
      waterTempData,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error in fetchMarineData:", error)
    throw new Error("Failed to fetch marine data")
  }
}
