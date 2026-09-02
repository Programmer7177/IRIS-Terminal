export interface ChainFlowsData {
  inflow: number;
  outflow: number;
  cumulative: number;
}

export interface ChainFlowsArgs {
  symbol?: string;
  days?: number;
}
