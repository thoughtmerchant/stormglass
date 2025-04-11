"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Use window.location.reload() instead of router.refresh()
    // This is a more direct approach that avoids Suspense issues
    window.location.reload()

    // Note: The state reset below won't actually happen because of the page reload,
    // but we'll keep it in case we change the refresh method later
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-1">
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
    </Button>
  )
}
