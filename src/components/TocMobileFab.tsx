import { useEffect, useState } from 'react';

interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

export default function TocMobileFab({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
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

  if (toc.length === 0) return null;

  return (
    <div className="lg:hidden">
      {/* 1. NÚT FAB - HÌNH VUÔNG BO GÓC */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mục lục"
        className={`
          fixed z-[70] bottom-30 right-4
          w-12 h-12 flex items-center justify-center
          /* THAY ĐỔI: rounded-2xl tạo hình vuông bo góc hiện đại */
          rounded-2xl shadow-xl active:scale-95 transition-all duration-300
          border backdrop-blur-md
          
          /* Màu sắc đồng bộ Light/Dark */
          bg-white/90 text-slate-900 border-slate-200
          dark:bg-slate-900/90 dark:text-[#ff7a18] dark:border-white/10
        `}
      >
        {isOpen ? (
          /* Nút X */
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          /* Nút Menu /// */
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
        )}
      </button>

      {/* 2. KHUNG MỤC LỤC */}
      <nav className={`
        fixed z-[65] bottom-30 right-4 left-4
        p-6 rounded-[24px] border shadow-2xl backdrop-blur-3xl
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        
        bg-white/95 border-slate-200
        dark:bg-slate-900/95 dark:border-white/10
        
        ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}
      `}>
        <div className="flex items-center mb-5">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff7a18]">
            Mục lục bài viết
          </p>
        </div>

        <ul className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {toc.map((h) => (
            <li key={h.slug} className={`${h.depth === 3 ? 'ml-4 border-l border-slate-200 dark:border-slate-700 pl-3' : ''}`}>
              <a 
                href={`#${h.slug}`} 
                onClick={() => setIsOpen(false)} 
                className={`block py-1 text-sm transition-all duration-300 ${
                  activeId === h.slug 
                  ? 'font-bold text-[#ff7a18] translate-x-1' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 3. LỚP PHỦ NỀN */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] z-[60]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}