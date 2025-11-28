import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    const url = new URL(imageUrl);
    const allowedHostnames = [
      'rewardsapi.hireagent.co',
      'hireagent.co',
      'c.animaapp.com',
      'lh3.googleusercontent.com',
    ];

    if (!allowedHostnames.includes(url.hostname)) {
      return NextResponse.json({ error: 'Unauthorized image host' }, { status: 403 });
    }

    const imageResponse = await fetch(url);

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from ${imageUrl}: ${imageResponse.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: imageResponse.status });
    }

    const contentType = imageResponse.headers.get('content-type');
    const arrayBuffer = await imageResponse.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

