import { asRow, getSupabase } from '@/lib/supabase/server';
import type { ChainFlowsData, ChainFlowsArgs } from './types';

interface RowDb {
  inflow: number;
  outflow: number;
  cumulative: number;
  fetched_at: string;
}

export async function fetchChainFlows({ symbol = 'BTC', days = 30 }: ChainFlowsArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('exchange_netflows')
    .select('inflow, outflow, cumulative, fetched_at')
    .eq('symbol', symbol)
    .gte('fetched_at', new Date(Date.now() - days * 86400000).toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = asRow<RowDb>(data);
  return {
    data: {
      inflow: row.inflow,
      outflow: row.outflow,
      cumulative: row.cumulative,
    },
    asOf: row.fetched_at,
    synthetic: false,
  };
}
