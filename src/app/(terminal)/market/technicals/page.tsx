import { getIndicators } from '@/lib/features/indicators';
import { PanelGrid } from '@/components/primitives';
import { RsiOscillator } from '@/components/features/technicals/RsiOscillator';
import { MacdHistogram } from '@/components/features/technicals/MacdHistogram';
import { MaTable } from '@/components/features/technicals/MaTable';
import { BollingerState } from '@/components/features/technicals/BollingerState';

export const revalidate = 30;

export default async function TechnicalsPage() {
  const [indicators] = await Promise.all([getIndicators({ symbol: 'BTC-USD' })]);

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
      <PanelGrid columns="repeat(auto-fit, minmax(340px, 1fr))">
        <RsiOscillator indicators={indicators} />
        <MacdHistogram indicators={indicators} />
      </PanelGrid>
      <MaTable indicators={indicators} />
      <BollingerState indicators={indicators} />
    </div>
  );
}
