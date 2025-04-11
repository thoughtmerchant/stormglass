"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Thought Merchants" 
              width={48} 
              height={48} 
              className="mr-4"
            />
          </Link>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
