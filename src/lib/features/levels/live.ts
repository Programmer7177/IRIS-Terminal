import { asRow, getSupabase } from '@/lib/supabase/server';
import type { SupportResistanceLevels, LevelsArgs } from './types';

interface RowDb {
  r2: number;
  r1: number;
  vwap: number;
  s1: number;
  s2: number;
  fetched_at: string;
}

export async function fetchLevels({ symbol = 'BTC' }: LevelsArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('support_resistance')
    .select('r2, r1, vwap, s1, s2, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      r2: row.r2,
      r1: row.r1,
      vwap: row.vwap,
      s1: row.s1,
      s2: row.s2,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
