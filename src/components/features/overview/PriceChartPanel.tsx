import { Panel, PanelHeader, MockBadge, SourceFootnote } from '@/components/primitives';
import type { Envelope } from '@/lib/envelope';
import type { OhlcvCandle } from '@/lib/features/ohlcv';
import { fmtUsd } from '@/lib/format';

export interface PriceChartPanelProps {
  ohlcv: Envelope<OhlcvCandle[]>;
}

export function PriceChartPanel({ ohlcv }: PriceChartPanelProps) {
  const candles = ohlcv.data;
  const latest = candles[candles.length - 1];
  const oldest = candles[0];

  const current = latest?.close ?? 0;
  const high = Math.max(...candles.map((c) => c.high));
  const low = Math.min(...candles.map((c) => c.low));

  // Simple line chart using SVG
  const chartHeight = 120;
  const chartWidth = 100;
  const padding = 10;

  // Normalize values to chart coordinates
  const range = high - low;
  const yScale = range > 0 ? (chartHeight - padding * 2) / range : 1;
  const xScale = candles.length > 1 ? (chartWidth - padding * 2) / (candles.length - 1) : 1;

  // Build SVG path for line chart
  let pathD = '';
  candles.forEach((candle, i) => {
    const x = padding + i * xScale;
    const y = chartHeight - padding - (candle.close - low) * yScale;
    pathD += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  });

  return (
    <Panel style={{ display: 'flex', flexDirection: 'column' }}>
      <PanelHeader
        title="PRICE CHART"
        note={`${candles.length} candles`}
        right={<MockBadge env={ohlcv} />}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          gap: '12px',
        }}
      >
        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--sunk)', padding: '8px', fontSize: '11px' }}>
            <div style={{ color: 'var(--mut)', fontSize: '9px', marginBottom: '2px' }}>CURRENT</div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--up)' }}>
              {fmtUsd(current)}
            </div>
          </div>
          <div style={{ background: 'var(--sunk)', padding: '8px', fontSize: '11px' }}>
            <div style={{ color: 'var(--mut)', fontSize: '9px', marginBottom: '2px' }}>HIGH 24H</div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--txt)' }}>
              {fmtUsd(high)}
            </div>
          </div>
          <div style={{ background: 'var(--sunk)', padding: '8px', fontSize: '11px' }}>
            <div style={{ color: 'var(--mut)', fontSize: '9px', marginBottom: '2px' }}>LOW 24H</div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--down)' }}>
              {fmtUsd(low)}
            </div>
          </div>
        </div>

        {/* Simple line chart */}
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '60px', stroke: 'var(--line2)' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={`h-${pct}`}
              x1={padding}
              x2={chartWidth - padding}
              y1={chartHeight - padding - pct * (chartHeight - padding * 2)}
              y2={chartHeight - padding - pct * (chartHeight - padding * 2)}
              stroke="var(--line2)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Price line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--blue)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Current price marker */}
          {latest && (
            <circle
              cx={chartWidth - padding}
              cy={chartHeight - padding - (latest.close - low) * yScale}
              r="2"
              fill="var(--blue)"
            />
          )}
        </svg>
      </div>
      <SourceFootnote env={ohlcv} />
    </Panel>
  );
}
