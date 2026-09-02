import { seeded } from '@/lib/rng';
import type { ChainFlowsData, ChainFlowsArgs } from './types';

export function mockChainFlows({ symbol = 'BTC', days = 30 }: ChainFlowsArgs): ChainFlowsData {
  const r = seeded(`chain_flows_${symbol}`);
  
  const inflow = 20000000 + (r() - 0.5) * 30000000;
  const outflow = 20000000 + (r() - 0.5) * 30000000;
  
  return {
    inflow,
    outflow,
    cumulative: (inflow - outflow) * days * 0.1,
  };
}
