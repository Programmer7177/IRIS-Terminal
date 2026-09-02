import { asRow, getSupabase } from '@/lib/supabase/server';
import type { BtcSnapshot, SnapshotArgs } from './types';

/** The exact columns this query selects, in `market_snapshot`. */
interface SnapshotRowDb {
  last_price: number | null;
  change_24h_abs: number | null;
  change_24h_pct: number | null;
  high_24h: number | null;
  low_24h: number | null;
  return_7d_pct: number | null;
  return_30d_pct: number | null;
  volume_24h_usd: number | null;
  market_cap_usd: number | null;
  dominance_pct: number | null;
  realized_vol_30d_pct: number | null;
  is_synthetic: boolean;
  fetched_at: string;
}

const SELECT =
  'last_price, change_24h_abs, change_24h_pct, high_24h, low_24h, return_7d_pct, ' +
  'return_30d_pct, volume_24h_usd, market_cap_usd, dominance_pct, ' +
  'realized_vol_30d_pct, is_synthetic, fetched_at';

/** Reads the newest `market_snapshot` row. `null` means the job has not run. */
export async function fetchSnapshot({ symbol }: SnapshotArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('market_snapshot')
    .select(SELECT)
    .eq('symbol', symbol)
    .order('as_of', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<SnapshotRowDb>(data);
  const num = (v: number | null) => (v == null ? 0 : Number(v));

  const out: BtcSnapshot = {
    last: num(row.last_price),
    change24hAbs: num(row.change_24h_abs),
    change24hPct: num(row.change_24h_pct),
    high24h: num(row.high_24h),
    low24h: num(row.low_24h),
    return7dPct: num(row.return_7d_pct),
    return30dPct: num(row.return_30d_pct),
    volume24hUsd: num(row.volume_24h_usd),
    marketCapUsd: num(row.market_cap_usd),
    dominancePct: num(row.dominance_pct),
    realizedVol30dPct: num(row.realized_vol_30d_pct),
  };

  return { data: out, asOf: row.fetched_at, synthetic: Boolean(row.is_synthetic) };
}
