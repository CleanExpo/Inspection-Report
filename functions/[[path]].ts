interface Env {
  // Add your environment bindings here
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle API routes
  if (path.startsWith('/api/')) {
    try {
      // Set CORS headers for API routes
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      // Handle OPTIONS requests for CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      // Add security headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-XSS-Protection', '1; mode=block');

      // Handle API request
      // You can add your API logic here or proxy to your Next.js API routes
      const response = await fetch(request);
      
      // Copy original headers and add security headers
      response.headers.forEach((value, key) => headers.set(key, value));
      
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // For non-API routes, let Next.js handle the request
  try {
    const response = await context.next();
    return response;
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};
