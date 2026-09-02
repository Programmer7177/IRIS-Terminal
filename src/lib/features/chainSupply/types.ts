export interface ChainSupplyMetrics {
  activeAddresses: number;
  newAddresses: number;
  txCount: number;
  hashRate: number;
  coldPct: number;
  hotPct: number;
}

export interface ChainSupplyArgs {
  symbol?: string;
}
