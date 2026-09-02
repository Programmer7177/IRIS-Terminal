import { asRow, getSupabase } from '@/lib/supabase/server';
import type { ConfluenceData, ConfluenceArgs } from './types';

interface RowDb {
  score_macro: number;
  score_onchain: number;
  score_sentiment: number;
  score_technical: number;
  score_news: number;
  overall_score: number;
  bullish_score: number;
  bearish_score: number;
  fetched_at: string;
}

export async function fetchConfluence({ symbol = 'BTC' }: ConfluenceArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('confluence_scores')
    .select('score_macro, score_onchain, score_sentiment, score_technical, score_news, overall_score, bullish_score, bearish_score, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      layers: {
        MACRO: row.score_macro,
        ONCHAIN: row.score_onchain,
        SENTIMENT: row.score_sentiment,
        TECHNICAL: row.score_technical,
        NEWS: row.score_news,
      },
      scores: {
        overall: row.overall_score,
        bullish: row.bullish_score,
        bearish: row.bearish_score,
      },
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
