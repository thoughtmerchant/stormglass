"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col md:flex-row min-h-screen dark:bg-slate-950">
      {/* Left sidebar navigation */}
      {/* Top navigation for mobile and theme toggle */}
      <div className="md:hidden">
        <NavBar />
      </div>

      <div className="w-full md:w-64 p-8 md:fixed md:h-screen dark:bg-slate-900">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Santa Monica Bay"
              width={40}
              height={40}
              className="mx-auto md:mx-0"
            />
          </Link>
        </div>

        <nav className="space-y-2">
          <Link
            href="/"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/historical"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/historical" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Historical Data
          </Link>
          <Link
            href="/hourly"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/hourly" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Hourly Forecast
          </Link>
          <Link
            href="/output"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/output" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Output
          </Link>
          <Link
            href="/font-debug"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/font-debug" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Font Debug
          </Link>
          <Link
            href="/vestaboard"
            className={`block py-1 hover:text-blue-600 transition-colors ${
              pathname === "/vestaboard" ? "text-blue-600 font-medium" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Vestaboard
          </Link>

          {/* Submenu section with a separator */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/data-sources"
              className={`block py-1 hover:text-blue-600 transition-colors ${
                pathname === "/data-sources" ? "text-blue-600 font-medium" : "text-slate-600 dark:text-slate-400 text-sm"
              }`}
            >
              Data Sources
            </Link>
            <Link
              href="/methodology"
              className={`block py-1 hover:text-blue-600 transition-colors ${
                pathname === "/methodology" ? "text-blue-600 font-medium" : "text-slate-600 dark:text-slate-400 text-sm"
              }`}
            >
              Methodology
            </Link>
            <Link
              href="/work-in-progress"
              className={`block py-1 hover:text-blue-600 transition-colors ${
                pathname === "/work-in-progress" ? "text-blue-600 font-medium" : "text-slate-600 dark:text-slate-400 text-sm"
              }`}
            >
              Work in Progress
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 bg-white dark:bg-slate-950">
        {/* Top navigation (desktop) */}
        <div className="hidden md:block">
          <NavBar />
        </div>
        {children}
      </main>
    </div>
  )
}
