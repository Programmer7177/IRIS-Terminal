import { asRow, getSupabase } from '@/lib/supabase/server';
import type { NewsArticle, NewsArgs } from './types';

interface RowDb {
  title: string;
  source: string;
  sentiment: string;
  btc_window: string;
  url?: string;
}

export async function fetchNews({ limit = 5 }: NewsArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('news_articles')
    .select('title, source, sentiment, btc_window, url')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return {
    data: data.map(d => {
      const row = asRow<RowDb>(d);
      return {
        title: row.title,
        source: row.source,
        sentiment: row.sentiment as 'positive' | 'negative' | 'neutral',
        btcWindow: row.btc_window,
        url: row.url,
      };
    }),
    asOf: new Date().toISOString(),
    synthetic: false,
  };
}
