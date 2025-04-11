# Stormglass Surf Forecast

A web application that provides high-resolution forecasts for marine and weather conditions for surfing spots worldwide.

## Features

- Search for surf spots by location name
- View marine forecasts (wave height, direction, period)
- View tide information with visualization
- View weather conditions (wind speed, direction, temperature)
- 10-day forecast capabilities
- Astronomical data (sunrise, sunset)

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI components

## Getting Started

### Prerequisites

- Node.js (use ASDF version manager)
- PNPM package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/stormglass.git
   cd stormglass
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Run the development server
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js app directory containing pages and layouts
- `components/`: React components
- `lib/`: Utility functions and service integrations
- `public/`: Static assets
- `content/`: Markdown content for blog posts
- `styles/`: Global CSS styles

## License

MIT
