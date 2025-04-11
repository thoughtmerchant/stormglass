"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-200 mb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="font-semibold text-slate-900">Santa Monica Bay</div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/historical"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/historical" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Historical
            </Link>
            <Link
              href="/hourly"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/hourly" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Hourly Forecast
            </Link>
            <Link
              href="/compare"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/compare" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/output"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/output" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Output
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
