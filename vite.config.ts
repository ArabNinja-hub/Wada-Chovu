import { defineConfig, type Plugin } from 'vite';
import { renderHeadMeta, renderPage } from './src/render/page.ts';

/**
 * Prerenders the page into index.html, in both dev and production builds.
 *
 * The content is complete in the HTML before any JavaScript runs, so the first paint
 * shows real text and no layout shifts. The client code only adds behaviour.
 */
function prerender(): Plugin {
  return {
    name: 'chovu-chovu-brothers:prerender',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace('<!--head-meta-->', renderHeadMeta()).replace('<!--app-html-->', renderPage());
      },
    },
  };
}

// Hosts allowed to reach the dev and preview servers. The sandbox preview is served from
// *.e2b.app, so that suffix is included. Add your own host here if you expose the server.
const allowedHosts = ['.e2b.app', 'localhost', '127.0.0.1'];

export default defineConfig({
  // Project site: https://<user>.github.io/Wada-Chovu/ (the repository name sets this path)
  base: '/Wada-Chovu/',
  plugins: [prerender()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts,
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    chunkSizeWarningLimit: 600,
  },
});
