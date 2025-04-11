"use client"

import { useState } from "react"
import { getCharacterPath, calculatePathBounds, normalizePathForNumbersAndSymbols } from "@/lib/single-stroke-font"

export default function FontDebugPage() {
  const [scale, setScale] = useState(0.5)
  const [strokeWidth, setStrokeWidth] = useState(1)

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,- "

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Single Stroke Font Debug</h1>

      <div className="mb-8 flex gap-8">
        <label>
          <span className="block text-sm mb-1">Scale</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number.parseFloat(e.target.value))}
            className="w-48"
          />
          <span className="ml-2">{scale}</span>
        </label>

        <label>
          <span className="block text-sm mb-1">Stroke Width</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number.parseFloat(e.target.value))}
            className="w-48"
          />
          <span className="ml-2">{strokeWidth}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.split("").map((char) => {
          const charPath = getCharacterPath(char)
          if (!charPath) return null

          const pathBounds = calculatePathBounds(charPath.path)
          const margin = 5 * scale
          const viewBoxWidth = (pathBounds.maxX - pathBounds.minX + margin * 2) * scale
          const viewBoxHeight = 60 * scale

          // For numbers and symbols, use the normalized path
          const displayPath = "0123456789.,-".includes(char)
            ? normalizePathForNumbersAndSymbols(charPath.path, char)
            : charPath.path

          return (
            <div key={char} className="border p-4 rounded-lg">
              <div className="text-center text-xl font-bold mb-2">{char === " " ? "[space]" : char}</div>
              <svg
                width={viewBoxWidth + 10}
                height={viewBoxHeight + 10}
                viewBox={`0 0 ${viewBoxWidth + 10} ${viewBoxHeight + 10}`}
                className="border border-dashed border-gray-400"
              >
                <rect
                  x="5"
                  y="5"
                  width={viewBoxWidth}
                  height={viewBoxHeight}
                  fill="none"
                  stroke="blue"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <g transform={`translate(${5 + margin}, ${5 + viewBoxHeight / 2})`}>
                  <path
                    d={displayPath}
                    transform={`translate(${-pathBounds.minX * scale}, ${-137.5 * scale}) scale(${scale})`}
                    fill="none"
                    stroke="black"
                    strokeWidth={strokeWidth}
                  />
                </g>
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
