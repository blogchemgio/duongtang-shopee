export type CategoryKey = 'blog' | 'bat-gioi-review' | 'ngo-khong-tech' | 'sa-tang-decor';

export const categoryMeta: Record<CategoryKey, { heading: string; intro: string; label: string }> = {
  blog: {
    heading: 'Chuyên mục Blog',
    intro: 'Đây là chuyên mục đường tăng review 81 kiếp nạn mua đồ trên shopee.',
    label: 'BLOG',
  },
  'bat-gioi-review': {
    heading: 'Chuyên mục Bát Giới Review',
    intro: 'Đây là chuyên mục Bát Giới Review đồ ăn ngon.',
    label: 'BÁT GIỚI',
  },
  'ngo-khong-tech': {
    heading: 'Chuyên mục Ngộ Không Tech',
    intro: 'Đây là chuyên mục Ngộ Không Tech. Chuyên chia sẻ về phép thuật và giải pháp công nghệ.',
    label: 'NGỘ KHÔNG',
  },
  'sa-tang-decor': {
    heading: 'Chuyên mục Sa Tăng decor',
    intro: 'Nếu mà mệt quá thì về quê ta cùng nuôi cá và trồng thêm rau',
    label: 'SA TĂNG',
  },
};
