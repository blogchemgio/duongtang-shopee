import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from "@astrojs/cloudflare";

// Các plugin hỗ trợ Table of Contents
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://duongtang.vn',
  output: 'hybrid',

  adapter: cloudflare({
    imageService: { build: 'compile', runtime: 'passthrough' },
  }),

  integrations: [react()],

  // Phần code bổ sung cho Table of Contents
  markdown: {
    rehypePlugins: [
      rehypeSlug, // Tự tạo id cho tiêu đề: "Cách cài đặt" -> id="cach-cai-dat"
      [rehypeAutolinkHeadings, { behavior: 'append' }], // Thêm icon link sau tiêu đề
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: [
        'astro/compiler-runtime',
        '@astrojs/cloudflare',
        '@astrojs/cloudflare/entrypoints/server',
      ],
    },
    ssr: {
      noExternal: ['@astrojs/cloudflare'],
    },
  },
});
