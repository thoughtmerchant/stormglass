"use server"

// Vestaboard character mapping
// Each character on the Vestaboard corresponds to a number from 0-69
const VESTABOARD_CHAR_MAP: Record<string, number> = {
  " ": 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 10,
  K: 11,
  L: 12,
  M: 13,
  N: 14,
  O: 15,
  P: 16,
  Q: 17,
  R: 18,
  S: 19,
  T: 20,
  U: 21,
  V: 22,
  W: 23,
  X: 24,
  Y: 25,
  Z: 26,
  "1": 27,
  "2": 28,
  "3": 29,
  "4": 30,
  "5": 31,
  "6": 32,
  "7": 33,
  "8": 34,
  "9": 35,
  "0": 36,
  "!": 37,
  "@": 38,
  "#": 39,
  $: 40,
  "(": 41,
  ")": 42,
  "-": 44,
  "+": 46,
  "&": 47,
  "=": 48,
  ";": 49,
  ":": 50,
  "'": 51,
  '"': 52,
  "%": 53,
  ",": 54,
  ".": 55,
  "/": 56,
  "?": 57,
  "°": 58, // Degree symbol
  // Red, orange, yellow, green, blue, purple, white
  red: 63,
  orange: 64,
  yellow: 65,
  green: 66,
  blue: 67,
  violet: 68,
  white: 69,
}

// Convert a string to Vestaboard character codes
function stringToVestaboardCodes(text: string): number[] {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      // If the character is in our map, return its code
      if (VESTABOARD_CHAR_MAP[char] !== undefined) {
        return VESTABOARD_CHAR_MAP[char]
      }
      // Default to space for unsupported characters
      return 0
    })
}

// Center a line on the Vestaboard (22 characters wide)
function centerLine(line: string): string {
  const lineLength = line.length
  if (lineLength >= 22) return line.substring(0, 22)

  const padding = Math.floor((22 - lineLength) / 2)
  return " ".repeat(padding) + line + " ".repeat(22 - lineLength - padding)
}

// Create a full Vestaboard message (6 rows of 22 characters)
function createVestaboardMessage(message: string): number[][] {
  // Split the message into lines (max 6)
  const lines = message.split("\n").slice(0, 6)

  // Convert each line to character codes
  const codedLines = lines.map((line) => {
    // Center each line individually
    const centeredLine = centerLine(line)
    // Truncate or pad each line to exactly 22 characters
    const paddedLine = centeredLine.padEnd(22, " ").substring(0, 22)
    return stringToVestaboardCodes(paddedLine)
  })

  // Pad with empty rows if we have fewer than 6 lines
  while (codedLines.length < 6) {
    codedLines.push(Array(22).fill(0)) // Empty row (all spaces)
  }

  return codedLines
}

// Implement the Read/Write API approach as per the documentation
export async function sendToVestaboard(message: string) {
  try {
    // Use the Read/Write API key provided
    const readWriteKey = "1f1533de+c20b+4515+b5d1+0c516d439ab2"

    // Format the message for Vestaboard
    const formattedMessage = createVestaboardMessage(message)

    // Log the request details for debugging
    console.log("Sending to Vestaboard using Read/Write API")

    // Send the message using the Read/Write API
    const response = await fetch("https://rw.vestaboard.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vestaboard-Read-Write-Key": readWriteKey,
      },
      // We can send either text or character codes
      // Let's try both approaches - first with character codes
      body: JSON.stringify(formattedMessage),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    // Log response status for debugging
    console.log("Vestaboard Read/Write API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Vestaboard Read/Write API error: ${response.status} ${errorText}`)

      // If sending character codes fails, try with plain text as a fallback
      console.log("Trying with plain text as fallback")

      const textResponse = await fetch("https://rw.vestaboard.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Vestaboard-Read-Write-Key": readWriteKey,
        },
        body: JSON.stringify({ text: message }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!textResponse.ok) {
        const textErrorText = await textResponse.text()
        console.error(`Vestaboard Read/Write API text error: ${textResponse.status} ${textErrorText}`)
        return {
          success: false,
          error: "Both character codes and text approaches failed",
          details: {
            characterCodes: { status: response.status, body: errorText },
            text: { status: textResponse.status, body: textErrorText },
          },
        }
      }

      const textData = await textResponse.json()
      return { success: true, data: textData, source: "text-api" }
    }

    const data = await response.json()
    return { success: true, data, source: "character-codes-api" }
  } catch (error: any) {
    console.error("Error sending to Vestaboard:", error)
    return {
      success: false,
      error: "Failed to send message to Vestaboard",
      message: error.message,
      stack: error.stack,
    }
  }
}
