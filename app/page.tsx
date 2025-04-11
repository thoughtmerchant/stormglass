"use client"

import Image from "next/image"
import Link from "next/link"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  // Example case studies/clients - these would be replaced with actual data
  const caseStudies = [
    {
      name: "Aidem",
      description: "Branding a uniquely specific advertising platform.",
      logo: "/placeholder.svg",
      href: "/case-studies/aidem",
    },
    {
      name: "Allora",
      description: "Branding and product design for a self-improving decentralized intelligence network.",
      logo: "/placeholder.svg",
      href: "/case-studies/allora",
    },
    {
      name: "Casper",
      description: "Checkout optimization, scaling internationally, agile coaching.",
      logo: "/placeholder.svg",
      href: "/case-studies/casper",
    },
    {
      name: "Chainlink",
      description: "Branding one of the leading blockchain protocols in the world.",
      logo: "/placeholder.svg",
      href: "/case-studies/chainlink",
    },
  ]

  return (
    <SiteLayout>
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          People. Process. Product.
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="md:w-1/2">
            <p className="text-lg mb-4">
              Read our <Link href="/brand-narrative" className="text-blue-600 dark:text-blue-400 hover:underline">brand narrative</Link> or <Link href="/casper-case-study" className="text-blue-600 dark:text-blue-400 hover:underline">Casper case study</Link>.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image 
              src="/placeholder.jpg"
              alt="Thought Merchants showcase"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Featured Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((study) => (
            <Card key={study.name} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Image
                    src={study.logo}
                    alt={study.name}
                    width={40}
                    height={40}
                    className="mr-4"
                  />
                  <h3 className="text-xl font-medium">{study.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {study.description}
                </p>
                <Link 
                  href={study.href}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View case study
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Our Approach</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Design is never the finished product. It's thousands of little decisions made consciously and subconsciously, cued by the world around us. Here we share our design, identify our approach, comment on the industry, and highlight thought-provoking ephemeral that requires our opinion.
          </p>
          <p>
            We believe in starting with the hardest problems and working backwards. Our process combines strategic thinking with creative execution to deliver results that scale with soul.
          </p>
        </div>
      </section>
    </SiteLayout>
  )
}
