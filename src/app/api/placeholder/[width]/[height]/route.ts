import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  try {
    const width = parseInt(params.width)
    const height = parseInt(params.height)

    // Validate dimensions
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width > 2000 || height > 2000) {
      return NextResponse.json(
        { error: "Invalid dimensions" },
        { status: 400 }
      )
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          ${width}x${height}
        </text>
      </svg>
    `.trim()

    // Return SVG with proper headers
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error("Placeholder image generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate placeholder image" },
      { status: 500 }
    )
  }
}