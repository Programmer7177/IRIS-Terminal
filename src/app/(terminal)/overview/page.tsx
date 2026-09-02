import { getWeeklyForecast } from '@/lib/features/weeklyForecast';
import { getFearGreed } from '@/lib/features/fearGreed';
import { getConfluence } from '@/lib/features/confluence';
import { getBtcSnapshot } from '@/lib/features/snapshot';
import { getOhlcv } from '@/lib/features/ohlcv';
import { getIndicators } from '@/lib/features/indicators';
import { getSentiment } from '@/lib/features/sentiment';
import { getNews } from '@/lib/features/news';
import { SignalCards } from '@/components/features/overview/SignalCards';
import { BtcSnapshotPanel } from '@/components/features/overview/BtcSnapshot';
import { PriceChartPanel } from '@/components/features/overview/PriceChartPanel';
import { TechMiniTiles } from '@/components/features/overview/TechMiniTiles';
import { IntelligenceFeed } from '@/components/features/overview/IntelligenceFeed';

export const revalidate = 30;

export default async function OverviewPage() {
  // Fetch all data in parallel
  const [weeklyForecast, fearGreed, confluence, snapshot, ohlcv, indicators, sentiment, newsData] =
    await Promise.all([
      getWeeklyForecast({ symbol: 'BTC-USD' }),
      getFearGreed({ limit: 1 }),
      getConfluence({ symbol: 'BTC-USD' }),
      getBtcSnapshot({ symbol: 'BTC-USD' }),
      getOhlcv({ symbol: 'BTC-USD', interval: '1d', limit: 30 }),
      getIndicators({ symbol: 'BTC-USD' }),
      getSentiment({ days: 7 }),
      getNews({ limit: 10 }),
    ]);

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
      {/* Signal Cards Strip - 4 KPI cards */}
      <SignalCards
        weeklyForecast={weeklyForecast}
        fearGreed={fearGreed}
        confluence={confluence}
      />

      {/* BTC Snapshot - 10-row list */}
      <BtcSnapshotPanel snapshot={snapshot} />

      {/* Price Chart Panel */}
      <PriceChartPanel ohlcv={ohlcv} />

      {/* Technical Mini Tiles - 5 stat tiles */}
      <TechMiniTiles indicators={indicators} />

      {/* Live Intelligence Feed - Sentiment + News */}
      <IntelligenceFeed sentiment={sentiment} news={newsData} />
    </div>
  );
}
