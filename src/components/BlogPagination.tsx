import Link from 'next/link';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  tag?: string;
  search?: string;
}

export default function BlogPagination({ currentPage, totalPages, tag, search }: BlogPaginationProps) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-4 py-2 bg-white/90 border border-sky-100 rounded-lg text-sky-700 hover:bg-sky-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          ← Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`px-3 py-2 rounded-lg text-sm transition ${
            page === currentPage
              ? 'bg-sky-600 text-white'
              : 'bg-white/90 border border-sky-100 text-sky-700 hover:bg-sky-50 dark:bg-slate-800 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-700'
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-4 py-2 bg-white/90 border border-sky-100 rounded-lg text-sky-700 hover:bg-sky-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
