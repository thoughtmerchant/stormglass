export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-12">
        <h1 className="text-3xl font-normal text-slate-800 mb-4">About</h1>
        <p className="text-slate-600">
          We are dedicated to providing accurate marine and weather information for Santa Monica Bay.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium text-slate-800 mb-3">Our Mission</h2>
          <p className="text-slate-600">
            To provide accessible, accurate, and actionable marine data to help people make informed decisions about
            their ocean activities.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-slate-800 mb-3">Our Team</h2>
          <p className="text-slate-600 mb-4">
            Our team consists of marine scientists, data analysts, and software engineers passionate about ocean
            conservation and public education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-medium text-slate-800">Dr. Emily Chen</h3>
              <p className="text-sm text-slate-600">Marine Biologist & Data Scientist</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-medium text-slate-800">Michael Rodriguez</h3>
              <p className="text-sm text-slate-600">Oceanographer & Visualization Specialist</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-medium text-slate-800">Sarah Johnson</h3>
              <p className="text-sm text-slate-600">Software Engineer & Data Analyst</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-medium text-slate-800">David Kim</h3>
              <p className="text-sm text-slate-600">Meteorologist & Forecasting Expert</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-slate-800 mb-3">Contact Us</h2>
          <p className="text-slate-600">
            For inquiries about our data, services, or collaboration opportunities, please contact us at{" "}
            <a href="mailto:info@example.com" className="text-blue-600 hover:underline">
              info@example.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
