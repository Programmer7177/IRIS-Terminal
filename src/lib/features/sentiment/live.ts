import { asRow, getSupabase } from '@/lib/supabase/server';
import type { SentimentData, SentimentArgs } from './types';

interface RowDb {
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  score: number;
  fetched_at: string;
}

export async function fetchSentiment({ days = 7 }: SentimentArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('sentiment_distribution')
    .select('positive_pct, negative_pct, neutral_pct, score, fetched_at')
    .gte('fetched_at', new Date(Date.now() - days * 86400000).toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      positivePct: row.positive_pct,
      negativePct: row.negative_pct,
      neutralPct: row.neutral_pct,
      score: row.score,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
