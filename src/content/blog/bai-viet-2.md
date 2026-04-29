---
title: "Xây dựng giao diện Glassmorphism cực chất với Tailwind CSS"
description: "Hướng dẫn tạo hiệu ứng kính mờ (glassmorphism) hiện đại cho blog Astro chỉ với vài dòng code Tailwind."
pubDate: 2026-04-29
image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
tags: ["UI/UX", "TailwindCSS", "Astro"]
---

## Glassmorphism là gì?

Glassmorphism là phong cách thiết kế sử dụng hiệu ứng làm mờ hậu cảnh (backdrop-blur), tạo cảm giác các thành phần giao diện giống như những tấm kính mờ xếp chồng lên nhau. Đây là xu hướng cực kỳ bắt mắt cho các blog công nghệ hiện đại.

## Cách thực hiện với Tailwind CSS

Để có một "tấm kính" chuẩn, bạn cần kết hợp 4 yếu tố: Độ trong suốt, làm mờ, viền mảnh và bóng đổ.

### 1. Code mẫu cho Card
Dưới đây là class Tailwind cơ bản để tạo hiệu ứng này:

```html
<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
  <h3 class="text-white font-bold">Thẻ bài viết Glass</h3>
  <p class="text-white/70">Nội dung hiển thị mượt mà trên nền màu sắc.</p>
</div>