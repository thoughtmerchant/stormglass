// Types for character path data
interface CharacterPath {
  path: string
  width: number
}

// Replace the characterPaths object with this simplified version that avoids overlapping paths:

const characterPaths: Record<string, CharacterPath> = {
  // Uppercase letters with simplified paths
  A: {
    path: "M 14.35 129.50 L 16.25 127.10 L 20.15 125.00 L 30.45 125.00 L 30.45 150.35 L 33.30 149.50 L 30.40 149.25 L 30.40 125.00 L 22.70 125.00 L 20.15 125.00 L 16.25 127.10 L 14.35 129.50 Z M 12.60 139.65 L 16.50 135.40 L 22.10 134.15 L 28.25 135.80 L 30.45 138.00 L 28.25 135.80 L 22.10 134.15 L 16.50 135.40 L 12.60 139.65 L 12.60 145.55 L 14.75 148.40 L 18.15 149.90 L 22.25 150.05 L 24.25 149.55",
    width: 33.3,
  },
  B: {
    path: "M 50.20 115.15 L 50.20 150.00 M 50.25 146.15 L 50.85 148.15 L 52.90 149.90 L 54.05 150.00 L 52.90 149.90 L 50.85 148.15 L 50.25 146.15 M 50.10 132.65 L 50.65 131.30 L 52.25 128.55 L 54.35 126.35 L 57.05 125.00 L 61.40 125.00 L 64.75 127.25 L 66.55 130.75 L 67.20 135.15 L 67.20 139.20 L 66.45 143.35 L 65.00 146.95 L 62.90 149.55 L 61.55 150.00",
    width: 67.2,
  },
  C: {
    path: "M 100.40 129.40 L 99.10 127.05 L 95.75 125.00 L 90.45 125.00 L 86.60 127.15 L 84.10 130.70 L 82.95 135.25 L 82.95 139.90 L 84.05 144.40 L 86.40 147.85 L 90.00 150.00 L 95.15 150.00 L 99.35 147.70 L 100.30 145.55",
    width: 100.4,
  },
  D: {
    path: "M 133.30 115.15 L 133.30 150.00 M 133.25 144.15 L 132.80 147.25 L 130.25 150.00 L 128.80 150.00 M 133.40 132.30 L 132.35 129.00 L 127.80 125.00 L 122.30 125.00 L 119.10 127.40 L 117.15 131.05 L 116.30 135.35 L 116.30 139.20 L 116.45 143.40 L 117.40 147.00 L 119.45 149.65 L 121.30 150.15",
    width: 133.4,
  },
  E: {
    path: "M 157.40 137.35 L 169.90 137.35 L 169.90 135.10 L 168.65 130.75 L 166.15 127.25 L 162.55 125.00 L 157.85 125.00 L 154.40 127.10 L 152.10 130.40 L 150.90 134.50 L 150.90 138.85 L 151.90 143.65 L 154.20 147.55 L 158.00 150.00 L 165.70 150.00 L 168.10 145.60",
    width: 169.9,
  },
  F: {
    path: "M 197.15 115.95 L 196.45 115.50 L 195.20 115.00 L 192.00 115.00 L 190.15 118.40 L 190.15 150.00 M 185.35 126.15 L 197.05 126.15",
    width: 197.15,
  },
  G: {
    path: "M 229.75 124.70 L 229.75 154.10 L 229.70 155.60 L 228.30 157.90 L 226.05 159.40 L 223.20 160.20 L 220.75 160.20 L 218.50 159.60 L 216.40 158.50 L 214.70 157.05 L 214.30 156.20 M 229.75 142.10 L 225.35 149.60 M 229.90 131.60 L 229.25 130.45 L 227.45 128.10 L 225.30 126.20 L 222.75 124.95 L 218.85 124.95 L 215.35 127.30 L 213.15 130.90 L 212.15 135.30 L 212.15 139.30 L 212.70 143.30 L 214.05 146.75 L 216.25 149.30 L 217.85 149.75",
    width: 229.9,
  },
  H: {
    path: "M 247.65 132.55 L 248.50 129.00 L 251.70 125.00 L 257.20 125.00 L 260.40 126.75 L 262.50 129.60 L 263.50 133.20 L 263.50 150.00 M 247.70 115.00 L 247.70 150.00",
    width: 263.5,
  },
  I: {
    path: "M 282.10 125.00 L 282.10 150.00",
    width: 282.2,
  },
  J: {
    path: "M 301.05 125.00 L 301.15 155.75 L 300.80 157.95 L 299.90 159.65 L 298.20 160.70 L 295.40 160.70 L 294.45 159.95",
    width: 301.2,
  },
  K: {
    path: "M 334.70 125.00 L 319.50 141.90 M 319.50 115.00 L 319.50 150.00 M 326.50 134.10 L 335.90 150.00",
    width: 335.9,
  },
  L: {
    path: "M 352.20 115.00 L 352.20 150.00",
    width: 352.2,
  },
  M: {
    path: "M 370.75 125.00 L 370.75 150.00 M 385.65 150.00 L 385.65 131.50 L 384.70 128.70 L 382.90 126.45 L 380.35 125.00 L 377.20 125.00 L 374.70 126.30 L 372.70 128.40 L 371.25 131.10 L 370.80 132.45 M 400.65 150.00 L 400.65 133.65 L 400.05 130.00 L 398.50 127.00 L 395.85 125.00 L 392.10 125.00 L 389.10 126.35 L 386.90 128.60 L 385.65 131.45",
    width: 400.75,
  },
  N: {
    path: "M 435.60 150.00 L 435.80 132.90 L 435.10 129.55 L 433.30 126.75 L 430.40 125.00 L 424.75 125.00 L 420.30 129.25 L 419.40 132.40 M 419.40 125.00 L 419.40 150.00",
    width: 435.8,
  },
  O: {
    path: "M 466.25 150.00 L 467.90 149.30 L 470.15 146.75 L 471.55 143.45 L 472.20 139.75 L 472.20 135.50 L 471.10 130.65 L 468.70 126.80 L 465.00 124.40 L 459.80 124.40 L 456.25 126.75 L 454.05 130.55 L 453.10 135.30 L 453.10 141.65 L 455.75 148.60 L 459.05 150.00",
    width: 472.2,
  },
  P: {
    path: "M 489.45 125.00 L 489.45 160.20 M 489.45 132.10 L 489.95 130.30 L 491.90 127.60 L 494.40 125.85 L 497.15 125.00 L 501.35 125.00 L 505.10 128.70 L 506.90 134.25 L 506.80 140.75 L 504.90 146.30 L 501.20 150.00 L 496.95 149.90",
    width: 506.9,
  },
  Q: {
    path: "M 540.80 125.00 L 540.80 160.20 M 540.80 132.10 L 540.30 130.30 L 538.35 127.60 L 535.85 125.85 L 533.10 125.00 L 528.90 125.00 L 525.15 128.70 L 523.35 134.25 L 523.45 140.75 L 525.35 146.30 L 529.00 150.00 L 533.30 149.90",
    width: 540.8,
  },
  R: {
    path: "M 570.90 125.55 L 569.50 125.00 L 564.55 125.00 L 560.15 129.30 L 559.25 132.55 M 559.25 125.00 L 559.25 150.00",
    width: 570.9,
  },
  S: {
    path: "M 600.85 128.70 L 599.25 126.95 L 595.80 124.80 L 592.00 124.80 L 589.45 125.45 L 587.45 126.85 L 586.25 129.00 L 586.25 132.45 L 588.40 134.90 L 591.60 136.55 L 595.35 137.85 L 598.55 139.65 L 600.70 142.30 L 600.70 147.60 L 596.45 150.25 L 591.15 150.25 L 586.45 148.20 L 585.50 145.75",
    width: 600.85,
  },
  T: {
    path: "M 621.10 115.00 L 621.05 147.25 L 623.05 149.95 L 626.75 149.95 L 628.10 149.40 M 615.90 126.10 L 628.05 126.10",
    width: 628.1,
  },
  U: {
    path: "M 645.25 125.00 L 645.25 138.20 L 645.40 143.25 L 646.95 147.40 L 650.40 150.00 L 655.60 150.00 L 658.55 148.50 L 660.50 145.95 L 661.40 142.55 L 661.40 125.00 M 661.40 141.55 L 661.40 150.00",
    width: 661.45,
  },
  V: {
    path: "M 677.90 125.00 L 687.20 150.00 L 696.85 125.00",
    width: 696.85,
  },
  W: {
    path: "M 711.25 125.00 L 719.25 150.00 L 727.00 126.15 L 735.00 150.00 L 742.95 125.00",
    width: 742.95,
  },
  X: {
    path: "M 773.45 125.00 L 757.35 150.00 M 758.00 125.00 L 774.10 150.00",
    width: 774.1,
  },
  Y: {
    path: "M 807.35 125.00 L 798.05 150.75 L 794.75 158.50 L 794.05 160.10 L 791.20 160.70 L 789.75 160.25 M 788.60 125.00 L 798.00 150.00",
    width: 807.35,
  },
  Z: {
    path: "M 821.85 125.00 L 837.65 124.90 L 821.60 150.00 L 838.50 150.00",
    width: 838.5,
  },

  // Numbers with simplified paths
  "0": {
    path: "M 15 125 L 15 150 L 35 150 L 35 125 L 15 125",
    width: 50,
  },
  "1": {
    path: "M 25 125 L 25 150",
    width: 50,
  },
  "2": {
    path: "M 15 125 L 35 125 L 35 137 L 15 137 L 15 150 L 35 150",
    width: 50,
  },
  "3": {
    path: "M 15 125 L 35 125 L 35 137 L 15 137 M 35 137 L 35 150 L 15 150",
    width: 50,
  },
  "4": {
    path: "M 35 125 L 35 150 M 35 137 L 15 137 L 15 125",
    width: 50,
  },
  "5": {
    path: "M 35 125 L 15 125 L 15 137 L 35 137 L 35 150 L 15 150",
    width: 50,
  },
  "6": {
    path: "M 35 125 L 15 125 L 15 150 L 35 150 L 35 137 L 15 137",
    width: 50,
  },
  "7": {
    path: "M 15 125 L 35 125 L 35 150",
    width: 50,
  },
  "8": {
    path: "M 15 125 L 35 125 L 35 150 L 15 150 L 15 125 M 15 137 L 35 137",
    width: 50,
  },
  "9": {
    path: "M 35 150 L 35 125 L 15 125 L 15 137 L 35 137",
    width: 50,
  },

  // Special characters with simplified paths
  ".": {
    path: "M 25 148 L 25 150",
    width: 50,
  },
  ",": {
    path: "M 25 148 L 22 152",
    width: 50,
  },
  "-": {
    path: "M 15 137 L 35 137",
    width: 50,
  },
  " ": {
    path: "",
    width: 30,
  },
}

// Function to get the path data for a character
export function getCharacterPath(char: string): CharacterPath | null {
  const upperChar = char.toUpperCase()
  return characterPaths[upperChar] || characterPaths[" "]
}

// Function to get all character paths for debugging
export function getAllCharacterPaths(): Record<string, CharacterPath> {
  return characterPaths
}

// Function to calculate the actual bounds of a character path
export function calculatePathBounds(pathData: string): { minX: number; minY: number; maxX: number; maxY: number } {
  // Default bounds
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  }

  // Parse the SVG path data to extract coordinates
  const commands = pathData.match(/[MLZ][^MLZ]*/g) || []

  commands.forEach((cmd) => {
    const type = cmd[0]
    const coords = cmd.slice(1).trim().split(/\s+/).map(Number)

    // Process based on command type
    if (type === "M" || type === "L") {
      // For Move and Line commands, coordinates are x,y pairs
      for (let i = 0; i < coords.length; i += 2) {
        const x = coords[i]
        const y = coords[i + 1]

        if (!isNaN(x) && !isNaN(y)) {
          bounds.minX = Math.min(bounds.minX, x)
          bounds.minY = Math.min(bounds.minY, y)
          bounds.maxX = Math.max(bounds.maxX, x)
          bounds.maxY = Math.max(bounds.maxY, y)
        }
      }
    }
    // Z command has no coordinates
  })

  // If no valid coordinates were found, use default values
  if (bounds.minX === Number.POSITIVE_INFINITY) {
    return { minX: 0, minY: 115, maxX: 30, maxY: 160 }
  }

  return bounds
}

// Also update the normalizePathForNumbersAndSymbols function to ensure it returns clean paths:

export function normalizePathForNumbersAndSymbols(pathData: string, char: string): string {
  // For numbers and symbols, we'll create simple path data that works better
  // This is a temporary solution until we have proper path data for these characters

  if (char === "0") {
    return "M 12 125 L 12 150 L 30 150 L 30 125 L 12 125"
  } else if (char === "1") {
    return "M 20 125 L 20 150"
  } else if (char === "2") {
    return "M 12 125 L 30 125 L 30 137 L 12 137 L 12 150 L 30 150"
  } else if (char === "3") {
    return "M 12 125 L 30 125 L 30 137 L 12 137 M 30 137 L 30 150 L 12 150"
  } else if (char === "4") {
    return "M 30 125 L 30 150 M 30 137 L 12 137 L 12 125"
  } else if (char === "5") {
    return "M 30 125 L 12 125 L 12 137 L 30 137 L 30 150 L 12 150"
  } else if (char === "6") {
    return "M 30 125 L 12 125 L 12 150 L 30 150 L 30 137 L 12 137"
  } else if (char === "7") {
    return "M 12 125 L 30 125 L 30 150"
  } else if (char === "8") {
    return "M 12 125 L 30 125 L 30 150 L 12 150 L 12 125 M 12 137 L 30 137"
  } else if (char === "9") {
    return "M 30 150 L 30 125 L 12 125 L 12 137 L 30 137"
  } else if (char === ".") {
    return "M 20 148 L 20 150"
  } else if (char === ",") {
    return "M 20 148 L 18 152"
  } else if (char === "-") {
    return "M 12 137 L 30 137"
  }

  // Return the original path if no special handling is needed
  return pathData
}

export function generateSingleStrokeText(text: string, x: number, y: number, strokeWidth: number, scale = 0.5): string {
  // Convert text to uppercase
  text = text.toUpperCase()

  // Increase spacing between characters
  const spacing = 8 * scale // Increased from 5 to 8 for better separation

  // Calculate total width to center the text
  let totalWidth = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === " ") {
      totalWidth += 30 * scale // Space width
    } else {
      const charPath = getCharacterPath(char)
      if (charPath) {
        // Use the actual bounds of the character for width calculation
        const bounds = calculatePathBounds(charPath.path)
        totalWidth += (bounds.maxX - bounds.minX) * scale
      } else {
        totalWidth += 30 * scale // Default width for unknown characters
      }
    }
    if (i < text.length - 1) {
      totalWidth += spacing
    }
  }

  // Starting position to center the text
  let currentX = x - totalWidth / 2

  let textPaths = ""

  // Generate path for each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === " ") {
      currentX += 30 * scale // Space width
    } else {
      const charPath = getCharacterPath(char)
      if (charPath) {
        // Calculate the actual bounds of the character
        const bounds = calculatePathBounds(charPath.path)

        // For numbers and symbols, we need to adjust the transformation
        // The numbers in the character paths are using a different coordinate system
        if ("0123456789,.".includes(char)) {
          // For numbers and symbols, normalize the coordinates to a similar range as letters
          // This is a workaround for the unusual coordinate values in the number paths
          const normalizedPath = normalizePathForNumbersAndSymbols(charPath.path, char)

          textPaths += `<path d="${normalizedPath}" transform="translate(${currentX}, ${y - 137.5 * scale}) scale(${scale})" fill="none" stroke="black" stroke-width="${strokeWidth}" />`
        } else {
          // Transform the path to the current position and scale for letters
          textPaths += `<path d="${charPath.path}" transform="translate(${currentX - bounds.minX * scale}, ${y - 137.5 * scale}) scale(${scale})" fill="none" stroke="black" stroke-width="${strokeWidth}" />`
        }

        // Update position based on actual character width
        currentX += (bounds.maxX - bounds.minX) * scale
      } else {
        // Placeholder for unknown characters
        textPaths += `<rect x="${currentX}" y="${y - 15}" width="10" height="30" fill="none" stroke="black" stroke-width="${strokeWidth}" />`
        currentX += 10 * scale
      }
    }

    if (i < text.length - 1) {
      currentX += spacing
    }
  }

  return textPaths
}
