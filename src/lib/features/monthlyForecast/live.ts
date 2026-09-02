import { asRow, getSupabase } from '@/lib/supabase/server';
import type { MonthlyForecastPath, MonthlyForecastArgs } from './types';

interface RowDb {
  p10: number;
  p50: number;
  p90: number;
  path_pct: number[];
  fetched_at: string;
}

export async function fetchMonthlyForecast({ symbol = 'BTC', simulations = 1000 }: MonthlyForecastArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('monthly_forecast')
    .select('p10, p50, p90, path_pct, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      p10: row.p10,
      p50: row.p50,
      p90: row.p90,
      pathPct: row.path_pct || [],
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
