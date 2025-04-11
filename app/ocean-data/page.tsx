"use client"

import Link from "next/link"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Waves, Compass, BarChart3, Thermometer } from "lucide-react"

export default function OceanDataPage() {
  return (
    <SiteLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Ocean Data</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Explore marine and oceanographic data visualizations, tide forecasts, and wave analysis. 
          Our tools combine accurate data sources with intuitive visualizations to help you 
          understand ocean conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Waves className="h-6 w-6 text-blue-600" />
              <CardTitle>Tide Forecast</CardTitle>
            </div>
            <CardDescription>
              Accurate tide predictions and historical tide data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              View high and low tide times, tide heights, and graphical representations of 
              tide patterns for coastal locations.
            </p>
            <Link 
              href="/ocean-data/tide-forecast" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Tide Forecasts
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Compass className="h-6 w-6 text-blue-600" />
              <CardTitle>Wave Analysis</CardTitle>
            </div>
            <CardDescription>
              Detailed wave height, period, and direction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Analyze wave conditions including swell height, wave period, and 
              directional data with intuitive visualizations.
            </p>
            <Link 
              href="/ocean-data/wave-analysis" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Wave Analysis
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <CardTitle>Marine Dashboard</CardTitle>
            </div>
            <CardDescription>
              Comprehensive marine and weather data in one view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Access a complete dashboard with tide information, wave data, weather 
              conditions, and astronomical data for any coastal location.
            </p>
            <Link 
              href="/ocean-data/marine-dashboard" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Marine Dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Thermometer className="h-6 w-6 text-blue-600" />
              <CardTitle>Water Temperature</CardTitle>
            </div>
            <CardDescription>
              Historical and forecast water temperature data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Track water temperature trends, seasonal patterns, and 
              temperature anomalies for ocean and coastal waters.
            </p>
            <Link 
              href="/ocean-data/water-temperature" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Water Temperature Data
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h2>Data Sources</h2>
        <p>
          Our ocean data visualizations utilize data from multiple reputable sources including NOAA, 
          Stormglass.io, and other oceanographic institutes. We combine these data sources to provide 
          the most accurate and comprehensive marine information available.
        </p>
        
        <h2>Research & Analysis</h2>
        <p>
          Beyond raw data, we also provide analysis and research on ocean-related topics. 
          Visit our <Link href="/output" className="text-blue-600 dark:text-blue-400">Output</Link> section 
          to read our latest articles on tide prediction accuracy, understanding wave patterns, 
          water temperature trends, and more.
        </p>
      </div>
    </SiteLayout>
  )
}
