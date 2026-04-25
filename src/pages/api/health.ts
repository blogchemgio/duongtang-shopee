import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true, service: 'api-health' }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
