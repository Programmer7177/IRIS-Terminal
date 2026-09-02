import { asRow, getSupabase } from '@/lib/supabase/server';
import type { OhlcvCandle, OhlcvArgs } from './types';

interface RowDb {
  symbol: string;
  interval: string;
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  fetched_at: string;
}

export async function fetchOhlcv({ symbol = 'BTC', interval = '1h', limit = 100 }: OhlcvArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('ohlcv_candles')
    .select('symbol, interval, ts, open, high, low, close, volume, fetched_at')
    .eq('symbol', symbol)
    .eq('interval', interval)
    .order('ts', { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const rows = data.map(d => asRow<RowDb>(d));
  const first = rows[0];
  
  return {
    data: rows.map(r => ({
      symbol: r.symbol,
      interval: r.interval,
      ts: r.ts,
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume,
    })) as OhlcvCandle[],
    asOf: first.fetched_at,
    synthetic: false,
  };
}
