import { PanelStrip, StatTile, MockBadge } from '@/components/primitives';
import type { Envelope } from '@/lib/envelope';
import type { IndicatorData } from '@/lib/features/indicators';
import { toIndicatorLabels } from '@/lib/features/indicators/present';
import { type Tone, signTone } from '@/lib/theme/tokens';

export interface TechMiniTilesProps {
  indicators: Envelope<IndicatorData>;
}

function getIndicatorTone(value: number, type: 'rsi' | 'macd' | 'bollinger' | 'atr'): Tone {
  if (type === 'rsi') {
    if (value > 70) return 'up'; // Overbought
    if (value < 30) return 'down'; // Oversold
    return 'txt';
  }
  if (type === 'macd') return signTone(value);
  if (type === 'bollinger') {
    if (value > 0.8) return 'up'; // Near top band
    if (value < 0.2) return 'down'; // Near bottom band
    return 'txt';
  }
  if (type === 'atr') return signTone(value); // Positive means volatility
  return 'txt';
}

export function TechMiniTiles({ indicators }: TechMiniTilesProps) {
  const ind = indicators.data;
  const labels = toIndicatorLabels(ind);

  // Calculate Bollinger Bands %B: (Middle - Lower) / (Upper - Lower)
  const bollingerRange = ind.bollingerUpper - ind.bollingerLower;
  const bollingerPct = bollingerRange > 0 ? (ind.bollingerMiddle - ind.bollingerLower) / bollingerRange : 0.5;

  // ATR approximation: (Upper - Lower) / Middle * 100
  const atrApprox = ((ind.bollingerUpper - ind.bollingerLower) / ind.bollingerMiddle) * 100;

  // EMA gap: (EMA5 - EMA21) / EMA21 * 100
  const emaGapPct = ((ind.ema5 - ind.ema21) / ind.ema21) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--line)' }}>
      <PanelStrip>
        {/* RSI */}
        <StatTile
          label="RSI (14)"
          value={labels.rsi}
          tone={getIndicatorTone(ind.rsi, 'rsi')}
          detail={ind.rsi > 70 ? 'Overbought' : ind.rsi < 30 ? 'Oversold' : 'Neutral'}
        />

        {/* MACD */}
        <StatTile
          label="MACD"
          value={labels.macd}
          tone={getIndicatorTone(ind.macd, 'macd')}
          detail={`Signal: ${labels.macdSignal}`}
        />

        {/* EMA Gap */}
        <StatTile
          label="EMA GAP"
          value={emaGapPct.toFixed(2)}
          tone={signTone(emaGapPct)}
          detail="(EMA5 - EMA21) %"
        />

        {/* Bollinger %B */}
        <StatTile
          label="BOLLINGER %B"
          value={(bollingerPct * 100).toFixed(1)}
          tone={getIndicatorTone(bollingerPct, 'bollinger')}
          detail={bollingerPct > 0.8 ? 'Upper band' : bollingerPct < 0.2 ? 'Lower band' : 'Mid range'}
        />

        {/* ATR */}
        <StatTile
          label="ATR (VOL %)"
          value={atrApprox.toFixed(2)}
          tone={atrApprox > 5 ? 'up' : 'txt'}
          detail={atrApprox > 5 ? 'High volatility' : 'Normal'}
        />
      </PanelStrip>
    </div>
  );
}
