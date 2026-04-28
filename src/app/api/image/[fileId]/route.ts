import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Drive Image Proxy
 * 
 * Fetches an image from Google Drive by File ID, streams it back
 * with aggressive caching headers so Vercel's Edge CDN caches it.
 * 
 * Usage: /api/image/[fileId]
 * Example: /api/image/1AbC_dEfGhIjKlMnOpQrStUvWxYz
 * 
 * The Next.js <Image /> component can then use this as the src,
 * and it will automatically convert to WebP + resize.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
  }

  try {
    // Google Drive direct download URL
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    const response = await fetch(driveUrl, {
      headers: {
        // Mimic a browser request to avoid Drive blocking
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from Drive' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache for 30 days on Vercel Edge + browser
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400',
        // Allow Next.js Image Optimization to process this
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
