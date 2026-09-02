import { asRow, getSupabase } from '@/lib/supabase/server';
import type { ChainSupplyMetrics, ChainSupplyArgs } from './types';

interface RowDb {
  active_addresses: number;
  new_addresses: number;
  tx_count: number;
  hash_rate: number;
  cold_pct: number;
  hot_pct: number;
  fetched_at: string;
}

export async function fetchChainSupply({ symbol = 'BTC' }: ChainSupplyArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('chain_supply_metrics')
    .select('active_addresses, new_addresses, tx_count, hash_rate, cold_pct, hot_pct, fetched_at')
    .eq('symbol', symbol)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      activeAddresses: row.active_addresses,
      newAddresses: row.new_addresses,
      txCount: row.tx_count,
      hashRate: row.hash_rate,
      coldPct: row.cold_pct,
      hotPct: row.hot_pct,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
