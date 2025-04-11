"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 mb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Santa Monica Bay</div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/" 
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/historical"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/historical" 
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Historical
            </Link>
            <Link
              href="/hourly"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/hourly" 
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Hourly Forecast
            </Link>
            <Link
              href="/compare"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/compare" 
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/output"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/output" 
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Output
            </Link>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
