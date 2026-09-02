import { asRow, getSupabase } from '@/lib/supabase/server';
import type { FearGreedData, FearGreedArgs } from './types';

interface RowDb {
  value: number;
  classification: string;
  change_vs_prev: number | null;
  fetched_at: string;
}

export async function fetchFearGreed({ limit = 1 }: FearGreedArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('fear_greed_daily')
    .select('value, classification, change_vs_prev, fetched_at')
    .order('d', { ascending: false })
    .limit(limit)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      value: row.value,
      classification: row.classification as FearGreedData['classification'],
      changePct: row.change_vs_prev ?? 0,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
