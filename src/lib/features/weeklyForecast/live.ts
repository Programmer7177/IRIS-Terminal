import { asRow, getSupabase } from '@/lib/supabase/server';
import type { WeeklyForecastData, WeeklyForecastArgs } from './types';

interface RowDb {
  direction: string;
  confidence: number;
  range_min: number;
  range_max: number;
  fetched_at: string;
}

export async function fetchWeeklyForecast({ symbol = 'BTC' }: WeeklyForecastArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('weekly_forecast')
    .select('direction, confidence, range_min, range_max, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      label: row.direction as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
      confidence: row.confidence,
      range: { min: row.range_min, max: row.range_max },
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
