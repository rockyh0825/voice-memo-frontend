const ALLOWED_ORIGIN = 'https://voice-memo-frontend.pages.dev';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      if (origin === ALLOWED_ORIGIN) {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      return new Response('Forbidden', { status: 403 });
    }

    if (origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    // バックエンドへ転送
    const url = new URL(request.url);
    const backendUrl = env.BACKEND_URL + url.pathname + url.search;

    const backendRequest = new Request(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
        'Authorization': `Bearer ${env.API_TOKEN}`,
      },
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    });

    const response = await fetch(backendRequest);

    return new Response(response.body, {
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), ...CORS_HEADERS },
    });
  },
};
