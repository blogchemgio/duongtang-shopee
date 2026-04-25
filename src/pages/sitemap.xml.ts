import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://blogchengio.com';

export const GET: APIRoute = async () => {
  const [blog, docs, plugins, themes] = await Promise.all([
    getCollection('blog'),
    getCollection('docs'),
    getCollection('plugins'),
    getCollection('themes'),
  ]);

  const staticPaths = [
    '/',
    '/gioi-thieu',
    '/lien-he',
    '/blog',
    '/docs',
    '/plugins',
    '/themes',
    '/tim-kiem',
    '/sitemap',
  ];

  const dynamicPaths = [
    ...blog.map((item) => `/blog/${item.id}`),
    ...docs.map((item) => `/docs/${item.id}`),
    ...plugins.map((item) => `/plugins/${item.id}`),
    ...themes.map((item) => `/themes/${item.id}`),
  ];

  const urls = [...staticPaths, ...dynamicPaths]
    .map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`)
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
