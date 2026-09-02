import { asRow, getSupabase } from '@/lib/supabase/server';
import type { IndicatorData, IndicatorArgs } from './types';

interface RowDb {
  rsi: number;
  macd: number;
  macd_signal: number;
  ema5: number;
  ema8: number;
  ema13: number;
  ema21: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  fetched_at: string;
}

export async function fetchIndicators({ symbol = 'BTC' }: IndicatorArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('technical_indicators')
    .select('rsi, macd, macd_signal, ema5, ema8, ema13, ema21, bb_upper, bb_middle, bb_lower, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      rsi: row.rsi,
      macd: row.macd,
      macdSignal: row.macd_signal,
      ema5: row.ema5,
      ema8: row.ema8,
      ema13: row.ema13,
      ema21: row.ema21,
      bollingerUpper: row.bb_upper,
      bollingerMiddle: row.bb_middle,
      bollingerLower: row.bb_lower,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
