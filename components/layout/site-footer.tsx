"use client"

import Link from "next/link"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-medium mb-4">Thought Merchants</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              People. Process. Product.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contact</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Get in touch:{" "}
              <a 
                href="mailto:hello@thoughtmerchants.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                hello@thoughtmerchants.com
              </a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Our Bias</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Scale with a soul.</li>
              <li>Design is not magic. Design is a journey.</li>
              <li>Start with your hardest problem.</li>
              <li>Take care of the person.</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>© {currentYear} Thought Merchants. It's just serious play.</p>
        </div>
      </div>
    </footer>
  )
}
