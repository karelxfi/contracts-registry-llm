import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifest from '__STATIC_CONTENT_MANIFEST';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Try multiple path variations in order
    const pathsToTry = [];

    // Check if path has a file extension (for static assets)
    const lastSlashIndex = pathname.lastIndexOf('/');
    const lastPart = pathname.substring(lastSlashIndex + 1);
    const hasFileExtension = lastPart.includes('.') &&
                             (lastPart.endsWith('.html') ||
                              lastPart.endsWith('.json') ||
                              lastPart.endsWith('.css') ||
                              lastPart.endsWith('.js') ||
                              lastPart.endsWith('.png') ||
                              lastPart.endsWith('.jpg') ||
                              lastPart.endsWith('.svg') ||
                              lastPart.endsWith('.xml') ||
                              lastPart.endsWith('.txt') ||
                              lastPart.endsWith('.gz') ||
                              lastPart.endsWith('.ico') ||
                              lastPart.endsWith('.rss'));

    // If it's a static file or API endpoint, try to serve it
    if (hasFileExtension || pathname.startsWith('/api/') || pathname.startsWith('/protocols/') || pathname.startsWith('/chains/') || pathname.startsWith('/logos/') || pathname.startsWith('/chain-logos/') || pathname.startsWith('/categories/') || pathname.startsWith('/data/')) {
      if (pathname.endsWith('/')) {
        pathsToTry.push(pathname + 'index.html');
      } else if (!hasFileExtension) {
        pathsToTry.push(pathname + '/index.html');
        pathsToTry.push(pathname + '.html');
      } else {
        pathsToTry.push(pathname);
      }
    } else {
      // For all other routes (SPA routes like /protocol/aave-v2), serve index.html
      pathsToTry.push('/index.html');
    }

    // Try each path until one works
    for (const tryPath of pathsToTry) {
      try {
        url.pathname = tryPath;
        const modifiedRequest = new Request(url.toString(), request);

        return await getAssetFromKV(
          {
            request: modifiedRequest,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: manifest,
          }
        );
      } catch (e) {
        // If this path didn't work, try the next one
        continue;
      }
    }

    // If no paths worked, serve index.html for SPA fallback
    try {
      url.pathname = '/index.html';
      const modifiedRequest = new Request(url.toString(), request);

      return await getAssetFromKV(
        {
          request: modifiedRequest,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: manifest,
        }
      );
    } catch (e) {
      return new Response(`Not found: ${pathname}`, { status: 404 });
    }
  },
};
