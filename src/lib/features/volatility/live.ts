import { asRow, getSupabase } from '@/lib/supabase/server';
import type { VolatilityData, VolatilityArgs } from './types';

interface RowDb {
  vol_30d: number;
  vol_90d: number;
  fetched_at: string;
}

export async function fetchVolatility({ symbol = 'BTC' }: VolatilityArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('volatility_metrics')
    .select('vol_30d, vol_90d, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      vol30d: row.vol_30d,
      vol90d: row.vol_90d,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
