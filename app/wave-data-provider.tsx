// This is a Server Component that fetches data
import { getWaveData } from "@/lib/wave-service"

export async function getWaveDataForPage() {
  // In a real app, this would be an async call to an API
  // For now, we're using our synchronous mock data
  return getWaveData()
}
