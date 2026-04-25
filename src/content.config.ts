import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; 

// Cấu hình chung cho các trường hay dùng
const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional().default("Đang cập nhật mô tả..."),
  pubDate: z.coerce.date().optional(), // Để optional cho Docs
  image: z.string().optional(),
});

// 1. Chuyên mục BLOG
const duongTangBlog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/duong-tang-blog" }),
  schema: commonSchema.extend({
    tags: z.array(z.string()).default(['Chém Gió']),
  }),
});

// 2. Chuyên mục BÁT GIỚI REVIEW
const batGioiReview = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/docs" }),
  schema: commonSchema.extend({
    section: z.string(), 
    order: z.number().default(0),
  }),
});

// 3. Chuyên mục PLUGINS
const plugins = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/plugins" }),
  schema: commonSchema.extend({
    icon: z.string().optional(),
    category: z.string().default('General'),
  }),
});

// 4. Chuyên mục THEMES
const themes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/themes" }),
  schema: commonSchema.extend({
    author: z.string().default('Vercel'),
    demoUrl: z.string().url().optional(),
  }),
});

export const collections = { 'duong-tang-blog': duongTangBlog, 'bat-gioi-review': batGioiReview, plugins, themes };
