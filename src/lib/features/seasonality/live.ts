import { asRow, getSupabase } from '@/lib/supabase/server';
import type { SeasonalityCell, SeasonalityArgs } from './types';

interface RowDb {
  year: number;
  month: number;
  return_pct: number;
}

export async function fetchSeasonality({ symbol = 'BTC', years = 7 }: SeasonalityArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('seasonality_returns')
    .select('year, month, return_pct')
    .eq('symbol', symbol)
    .gte('year', new Date().getFullYear() - years);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return {
    data: data.map(d => {
      const row = asRow<RowDb>(d);
      return {
        year: row.year,
        month: row.month,
        returnPct: row.return_pct,
      };
    }),
    asOf: new Date().toISOString(),
    synthetic: false,
  };
}
