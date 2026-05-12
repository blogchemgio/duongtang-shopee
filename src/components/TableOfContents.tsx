import { useEffect, useState } from 'react';

interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    <nav className="bg-white/80 dark:bg-slate-950/20 p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-[#ff7a18] m-0">
          Mục lục bài viết
        </p>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-bold uppercase tracking-wider text-[#ff7a18] hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
        >
          {isOpen ? '[ Ẩn ]' : '[ Hiện ]'}
        </button>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto text-sm custom-scrollbar pt-2">
          {toc.map((h) => (
            <li key={h.slug} className={`${h.depth === 3 ? 'ml-4' : ''}`}>
              <a
                href={`#${h.slug}`}
                className={`block transition-all duration-300 border-l-2 pl-4 -ml-[1px] ${
                  activeId === h.slug 
                  ? 'font-extrabold text-black border-[#ff7a18] dark:text-white' 
                  : 'text-slate-600 border-transparent hover:text-black dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}