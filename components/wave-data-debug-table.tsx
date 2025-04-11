"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WaveData } from "@/lib/wave-service"

interface WaveDataDebugTableProps {
  waveData: WaveData
}

export function WaveDataDebugTable({ waveData }: WaveDataDebugTableProps) {
  if (!waveData) {
    return <div>No wave data available</div>
  }

  // Convert hourly forecast object to array for easier display
  const hourlyForecastArray = waveData.hourlyForecast
    ? Object.entries(waveData.hourlyForecast).map(([hour, data]) => ({
        hour: Number.parseInt(hour),
        ...data,
      }))
    : []

  // Sort by hour
  hourlyForecastArray.sort((a, b) => a.hour - b.hour)

  // Sort forecast by time
  const sortedForecast = [...waveData.forecast].sort((a, b) => a.time - b.time)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wave Data Debug Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Current Wave Data</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Time</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Height (ft)</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Period (s)</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Direction</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">
                    {new Date(waveData.current.time * 1000).toLocaleString()}
                  </td>
                  <td className="border border-slate-300 px-4 py-2">{waveData.current.height.toFixed(1)}</td>
                  <td className="border border-slate-300 px-4 py-2">{waveData.current.period}</td>
                  <td className="border border-slate-300 px-4 py-2">
                    {waveData.current.directionText} ({waveData.current.direction}°)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Hourly Forecast Data</h3>
            <p className="text-sm text-slate-500 mb-2">
              This shows all available hourly data points (0-23 hours). Missing hours indicate no data available for
              that hour.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Hour</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Time</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Height (ft)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Period (s)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyForecastArray.length > 0 ? (
                    hourlyForecastArray.map((data) => (
                      <tr key={data.hour}>
                        <td className="border border-slate-300 px-4 py-2">{data.hour}:00</td>
                        <td className="border border-slate-300 px-4 py-2">
                          {new Date(data.time * 1000).toLocaleString()}
                        </td>
                        <td className="border border-slate-300 px-4 py-2">{data.height.toFixed(1)}</td>
                        <td className="border border-slate-300 px-4 py-2">{data.period}</td>
                        <td className="border border-slate-300 px-4 py-2">
                          {data.directionText} ({data.direction}°)
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border border-slate-300 px-4 py-2 text-center">
                        No hourly forecast data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Raw Forecast Data Points</h3>
            <p className="text-sm text-slate-500 mb-2">
              This shows all raw forecast data points in chronological order.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Index</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Time</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Height (ft)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Period (s)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedForecast.length > 0 ? (
                    sortedForecast.map((data, index) => (
                      <tr key={index}>
                        <td className="border border-slate-300 px-4 py-2">{index}</td>
                        <td className="border border-slate-300 px-4 py-2">
                          {new Date(data.time * 1000).toLocaleString()}
                        </td>
                        <td className="border border-slate-300 px-4 py-2">{data.height.toFixed(1)}</td>
                        <td className="border border-slate-300 px-4 py-2">{data.period}</td>
                        <td className="border border-slate-300 px-4 py-2">
                          {data.directionText} ({data.direction}°)
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border border-slate-300 px-4 py-2 text-center">
                        No forecast data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Data Source Information</h3>
            <p>
              <strong>Source:</strong> {waveData.source}
            </p>
            <p>
              <strong>Status:</strong> {waveData.status}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
