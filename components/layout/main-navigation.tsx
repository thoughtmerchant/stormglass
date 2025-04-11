"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const mainNavItems = [
  { name: "Output", href: "/output" },
  { name: "Opinion", href: "/opinion" },
  { name: "Service", href: "/service" },
  { name: "Store", href: "/store" },
  { name: "Studio", href: "/studio" },
  { name: "About", href: "/about" },
  { name: "Compare", href: "/compare" },
  { name: "Ocean Data", href: "/ocean-data" },
  { name: "Tide Forecast", href: "/ocean-data/tide-forecast" },
  { name: "Wave Analysis", href: "/ocean-data/wave-analysis" },
  { name: "Marine Dashboard", href: "/ocean-data/marine-dashboard" }
]

export function MainNavigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="py-4">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <ul className="flex flex-col space-y-2">
            {mainNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`text-lg font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex justify-between items-center">
          <h3 className="text-xl font-semibold">Menu</h3>
          <button 
            onClick={toggleMobileMenu}
            className="p-2 focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-2 rounded-md shadow-lg bg-white dark:bg-slate-900">
            <ul className="space-y-2 p-4">
              {mainNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`block py-2 text-base font-medium ${
                      pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        ? "text-black dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
