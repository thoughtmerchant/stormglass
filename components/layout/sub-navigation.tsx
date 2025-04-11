"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const subNavItems = [
  { name: "Books", href: "/books" },
  { name: "Links", href: "/links" },
  { name: "Narrative", href: "/narrative" },
  { name: "Provocation", href: "/provocation" },
  { name: "Work in Progress", href: "/work-in-progress" },
]

export function SubNavigation() {
  const pathname = usePathname()

  return (
    <nav className="py-2 mb-6">
      <div className="container mx-auto px-4">
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
          <ul className="flex flex-col space-y-1">
            {subNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium ${
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
      </div>
    </nav>
  )
}
