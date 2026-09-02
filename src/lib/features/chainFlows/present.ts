import { fmtCompact } from '@/lib/format';
import type { ChainFlowsData } from './types';

export function toChainFlowsLabels(f: ChainFlowsData) {
  return {
    inflow: fmtCompact(f.inflow / 1e8, '') + ' BTC',
    outflow: fmtCompact(f.outflow / 1e8, '') + ' BTC',
    cumulative: fmtCompact(f.cumulative / 1e8, '') + ' BTC',
  };
}

export function getChainFlowsColor(cumulative: number): string {
  if (cumulative > 0) return 'var(--up)';
  if (cumulative < 0) return 'var(--down)';
  return 'var(--mut)';
}
