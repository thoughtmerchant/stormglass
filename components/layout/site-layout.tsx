"use client"

import { SiteHeader } from "@/components/layout/site-header"
import { MainNavigation } from "@/components/layout/main-navigation"
import { SubNavigation } from "@/components/layout/sub-navigation"
import { SiteFooter } from "@/components/layout/site-footer"

interface SiteLayoutProps {
  children: React.ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <div className="container mx-auto px-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <MainNavigation />
            <SubNavigation />
          </div>
          
          {/* Main Content */}
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  )
}
