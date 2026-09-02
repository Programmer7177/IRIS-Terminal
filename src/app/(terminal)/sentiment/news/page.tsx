import { getNews } from '@/lib/features/news';
import { NewsWire, type NewsFilter } from '@/components/features/news/NewsWire';

export const revalidate = 30;

function normalizeFilter(raw: string | undefined): NewsFilter {
  return raw === 'bullish' || raw === 'bearish' ? raw : 'all';
}

export default async function NewsWirePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const f = normalizeFilter(filter);
  const news = await getNews({ limit: 20 });

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <NewsWire news={news} filter={f} />
    </div>
  );
}
