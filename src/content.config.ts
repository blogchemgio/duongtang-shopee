import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; 

/**
 * NGUYÊN TẮC SEO VÀNG CỦA ĐƯỜNG TĂNG:
 * 1. Title: 50-60 ký tự (Đủ để Google hiển thị hết).
 * 2. Description: 140-160 ký tự (Hấp dẫn người dùng click).
 * 3. Image: Luôn có ảnh đại diện để hiển thị OpenGraph trên Facebook/Zalo.
 */

const commonSchema = z.object({
  title: z.string().min(10, "Tiêu đề quá ngắn không tốt cho SEO").max(70, "Tiêu đề quá dài sẽ bị Google cắt bớt"),
  description: z.string()
    .min(50, "Mô tả quá ngắn, hãy viết thêm để Google hiểu bài viết")
    .max(160, "Mô tả quá dài sẽ làm xấu kết quả Google")
    .default("Hành trình thỉnh kinh tại duongtang.vn - Chia sẻ kiến thức công nghệ và review sản phẩm chất lượng."),
  pubDate: z.coerce.date().default(() => new Date()),
  updatedDate: z.coerce.date().optional(), // Quan trọng để Google biết nội dung được làm mới
  image: z.string().optional().default('/default-og.webp'), // Ảnh mặc định để tránh lỗi hiển thị
  tags: z.array(z.string()).default([]),
  author: z.string().default('Đường Tăng'), // Giúp Google xác định thực thể (Entity) tác giả
  isDraft: z.boolean().default(false), // Để lọc bỏ bài nháp khi build
});

// 1. Chuyên mục BLOG (Nhật ký thỉnh kinh - SEO hướng tri thức)
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/blog" }),
  schema: commonSchema,
});

// 2. Chuyên mục BÁT GIỚI REVIEW (SEO hướng Affiliate & Sản phẩm)
const batGioiReview = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/bat-gioi-review" }),
  schema: commonSchema.extend({
    productName: z.string().optional(), // Để làm Schema Product sau này
    rating: z.number().min(0).max(5).default(5), // Hiển thị sao trên kết quả tìm kiếm
    section: z.string().default('Review Shopee'),
    priceRange: z.string().optional(),
  }),
});

// 3. Chuyên mục NGỘ KHÔNG TECH (SEO hướng Kỹ thuật & Thủ thuật)
const ngoKhongTech = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/ngo-khong-tech" }),
  schema: commonSchema.extend({
    category: z.string().default('Technology'),
    difficulty: z.enum(['Dễ', 'Trung bình', 'Khó']).default('Dễ'),
    icon: z.string().optional(),
  }),
});

// 4. Chuyên mục SA TĂNG DECOR (SEO hướng Hình ảnh & Không gian sống)
const saTangDecor = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/sa-tang-decor" }),
  schema: commonSchema.extend({
    brand: z.string().default('Unknown'),
    demoUrl: z.string().url().optional(),
  }),
});

// Xuất bản các Collection với định dạng Key an toàn cho Esbuild
export const collections = { 
  'blog': blog, 
  'bat-gioi-review': batGioiReview, 
  'ngo-khong-tech': ngoKhongTech, 
  'sa-tang-decor': saTangDecor 
};