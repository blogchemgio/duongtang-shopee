import { useEffect, useState } from 'react';

interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const toc = headings.filter((h) => h.depth > 1 && h.depth < 4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-100px 0% -60% 0%' }
    );
    document.querySelectorAll('h2, h3').forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return (
    /* 1. Tăng độ đục của nền trắng (bg-white/80) và đổ bóng nhẹ (shadow-sm) để nổi khối */
    <nav className="bg-white/80 dark:bg-slate-950/20 p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-300">
      
      {/* 2. Tiêu đề mục lục: Chuyển sang Slate-900 (đen đậm) thay vì Slate-400 */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-[#ff7a18]">
        Mục lục bài viết
      </p>

      <ul className="space-y-4 max-h-[70vh] overflow-y-auto text-sm custom-scrollbar">
        {toc.map((h) => (
          <li key={h.slug} className={`${h.depth === 3 ? 'ml-4' : ''}`}>
            <a
              href={`#${h.slug}`}
              className={`block transition-all duration-300 border-l-2 pl-4 -ml-[1px] ${
                activeId === h.slug 
                ? 'font-extrabold text-black border-[#ff7a18] dark:text-white' 
                /* 3. Trạng thái chưa active: text-slate-600 (đen xám rõ ràng) và hover đen hoàn toàn */
                : 'text-slate-600 border-transparent hover:text-black dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}