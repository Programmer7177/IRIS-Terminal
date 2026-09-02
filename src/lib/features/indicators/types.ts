export interface IndicatorData {
  rsi: number;
  macd: number;
  macdSignal: number;
  ema5: number;
  ema8: number;
  ema13: number;
  ema21: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
}

export interface IndicatorArgs {
  symbol?: string;
}
