export default function ServicePage() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-12">
        <h1 className="text-3xl font-normal text-slate-800 mb-4">Services</h1>
        <p className="text-slate-600">We provide data analysis and visualization services for marine environments.</p>
      </div>

      <div className="space-y-12">
        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-xl font-medium text-slate-800 mb-3">Data Collection</h2>
          <p className="text-slate-600 mb-4">
            We deploy sensors and collect data from various sources to provide comprehensive marine information.
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Water temperature monitoring</li>
            <li>Wave height and direction analysis</li>
            <li>Tide prediction and verification</li>
            <li>Weather condition tracking</li>
          </ul>
        </div>

        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-xl font-medium text-slate-800 mb-3">Data Analysis</h2>
          <p className="text-slate-600 mb-4">We analyze collected data to identify patterns, trends, and anomalies.</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Historical trend analysis</li>
            <li>Seasonal pattern identification</li>
            <li>Anomaly detection</li>
            <li>Correlation analysis</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-slate-800 mb-3">Visualization</h2>
          <p className="text-slate-600 mb-4">
            We create clear, informative visualizations to communicate marine data effectively.
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Interactive dashboards</li>
            <li>Time-series visualizations</li>
            <li>Spatial data mapping</li>
            <li>Custom data reports</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
