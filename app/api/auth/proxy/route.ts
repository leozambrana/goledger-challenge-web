import { NextRequest, NextResponse } from 'next/server';

const getBasicAuthHeader = () => {
  const user = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;

  if (!user || !password) {
    throw new Error('API_USERNAME and API_PASSWORD must be set in environment variables');
  }

  const token = Buffer.from(`${user}:${password}`).toString('base64');
  return `Basic ${token}`;
};

const getTargetUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be set in environment variables');
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
};

const proxyRequest = async (request: NextRequest) => {
  const endpoint = request.nextUrl.searchParams.get('endpoint');
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing query parameter: endpoint' }, { status: 400 });
  }

  const url = getTargetUrl(endpoint);

  const authHeader = getBasicAuthHeader();

  const headers = new Headers(request.headers);
  headers.set('Authorization', authHeader);
  headers.set('Content-Type', 'application/json');

  const body = await request.text();

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? body : undefined,
  });

  const responseBody = await res.text();

  return new NextResponse(responseBody, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      'content-type': res.headers.get('content-type') || 'application/json',
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    return await proxyRequest(request);
  } catch (error) {
    console.error('[proxy] POST error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Proxy request failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest(request);
  } catch (error) {
    console.error('[proxy] GET error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Proxy request failed' }, { status: 500 });
  }
}
