import { cn } from '../lib/utils';

type Chapter = {
  title: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  wordCount: number;
  releaseDate?: string;
};

type BookStat = {
  label: string;
  value: string;
};

type BookDetailProps = {
  title: string;
  description: string;
  genre: string;
  publicationStatus: string;
  stats: BookStat[];
  chapters: Chapter[];
  collectActionLabel?: string;
  onCollect?: () => void;
  className?: string;
};

const BookDetail = ({
  title,
  description,
  genre,
  publicationStatus,
  stats,
  chapters,
  collectActionLabel = 'Collect edition',
  onCollect,
  className,
}: BookDetailProps) => {
  return (
    <section className={cn('space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow', className)}>
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {genre}
        </p>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{publicationStatus}</p>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</dt>
            <dd className="text-lg font-semibold text-slate-900">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chapters</h3>
        <ul className="space-y-2">
          {chapters.map((chapter) => (
            <li
              key={chapter.title}
              className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{chapter.title}</p>
                <p className="text-xs text-slate-500">
                  {chapter.status} · {chapter.wordCount.toLocaleString()} words
                  {chapter.releaseDate ? ` · Releases ${chapter.releaseDate}` : ''}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {chapter.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCollect}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand/90"
        >
          {collectActionLabel}
        </button>
        <p className="text-xs text-slate-500">
          Contract interactions will appear here once ABIs are provided. Prepare metadata and pricing in advance.
        </p>
      </div>
    </section>
  );
};

export type { Chapter, BookStat, BookDetailProps };
export default BookDetail;
