import { getOhlcv } from '@/lib/features/ohlcv';
import { getLevels } from '@/lib/features/levels';
import { PriceChartLarge } from '@/components/features/market/PriceChartLarge';
import { LevelsLadder } from '@/components/features/market/LevelsLadder';

export const revalidate = 30;

export default async function PriceActionPage() {
  const [ohlcv, levels] = await Promise.all([
    getOhlcv({ symbol: 'BTC-USD', interval: '1d', limit: 90 }),
    getLevels({ symbol: 'BTC-USD' }),
  ]);

  const candles = ohlcv.data;
  const price = candles[candles.length - 1]?.close ?? 0;

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: 0,
      }}
    >
      <PriceChartLarge ohlcv={ohlcv} levels={levels} />
      <LevelsLadder levels={levels} price={price} />
    </div>
  );
}
