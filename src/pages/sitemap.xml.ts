import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://duongtang.vn';

export const GET: APIRoute = async () => {
  const [blog, batGioi, ngoKhongTech, satangdecor] = await Promise.all([
    getCollection('blog'),
    getCollection('bat-gioi-review'),
    getCollection('ngo-khong-tech'),
    getCollection('sa-tang-decor'),
  ]);

  const staticPaths = [
    '/',
    '/gioi-thieu',
    '/lien-he',
    '/blog',
    '/bat-gioi-review',
    '/ngo-khong-tech',
    '/sa-tang-decor',
    '/tim-kiem',
    '/sitemap',
  ];

  const dynamicPaths = [
    ...blog.map((item) => `/blog/${item.id}`),
    ...batGioi.map((item) => `/bat-gioi-review/${item.id}`),
    ...ngoKhongTech.map((item) => `/ngo-khong-tech/${item.id}`),
    ...satangdecor.map((item) => `/sa-tang-decor/${item.id}`),
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
