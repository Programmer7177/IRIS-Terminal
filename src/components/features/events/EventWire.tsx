'use client';

import type { CSSProperties } from 'react';
import { Tag } from '@/components/primitives';
import type { Tone } from '@/lib/theme/tokens';
import { CATEGORY_COLOR, toEventRow } from '@/lib/features/geopoliticalEvents';
import type { EventCategory, GeoEvent } from '@/lib/features/geopoliticalEvents';
import type { NewsArticle } from '@/lib/features/news';
import type { DetailPayload } from './WorldMap';

const SENTIMENT_TONE: Record<GeoEvent['sentiment'], Tone> = {
  positive: 'up',
  negative: 'down',
  neutral: 'txt',
};

function newsLabel(s: NewsArticle['sentiment']): string {
  return s === 'positive' ? 'BULL' : s === 'negative' ? 'BEAR' : 'NEUTRAL';
}

export interface EventWireProps {
  events: GeoEvent[];
  news: NewsArticle[];
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  onOpenDetail: (payload: DetailPayload | null) => void;
  activeCats: Set<EventCategory> | null;
}

export function EventWire({
  events,
  news,
  selectedKey,
  onSelectKey,
  onOpenDetail,
  activeCats,
}: EventWireProps) {
  const visible = events.filter((e) => !activeCats || activeCats.has(e.category));
  const newsRows = news.slice(0, 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <div className="iris-micro" style={sectionHead}>
          WORLD EVENTS · {visible.length} SHOWN
        </div>

        {visible.length === 0 ? (
          <div className="iris-micro" style={emptyBox}>
            NO EVENTS FOR THIS LAYER
          </div>
        ) : (
          visible.map((e) => {
            const row = toEventRow(e);
            const selected = e.id === selectedKey;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  onSelectKey(e.id);
                  onOpenDetail({ kind: 'event', event: e });
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  borderLeft: `2px solid ${CATEGORY_COLOR[e.category]}`,
                  borderBottom: '1px solid var(--line)',
                  background: selected ? 'var(--sunk)' : 'transparent',
                  padding: '8px 10px 8px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={headline2}>{row.headline}</div>
                <div className="iris-micro" style={metaRow}>
                  <span>{row.place}</span>
                  <span>·</span>
                  <span>{row.source}</span>
                  <span>·</span>
                  <span>{row.ago}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    <Tag label={row.sentimentLabel} tone={SENTIMENT_TONE[e.sentiment]} />
                  </span>
                </div>
              </button>
            );
          })
        )}

        <div className="iris-micro" style={{ ...sectionHead, borderTop: '1px solid var(--line)' }}>
          NEWS · {newsRows.length}
        </div>

        {newsRows.length === 0 ? (
          <div className="iris-micro" style={emptyBox}>
            NO HEADLINES
          </div>
        ) : (
          newsRows.map((a, i) => (
            <div
              key={`${a.source}-${i}`}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                padding: '8px 10px 8px 12px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={headline2}>{a.title}</div>
                <div className="iris-micro" style={metaRow}>
                  <span>{a.source}</span>
                </div>
              </div>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <Tag label={newsLabel(a.sentiment)} tone={SENTIMENT_TONE[a.sentiment]} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const sectionHead: CSSProperties = {
  padding: '7px 12px',
  borderBottom: '1px solid var(--line)',
  background: 'var(--sunk)',
  fontFamily: 'var(--mono)',
  fontSize: 8.5,
  letterSpacing: '.14em',
  color: 'var(--dim)',
};
const emptyBox: CSSProperties = {
  padding: 24,
  display: 'grid',
  placeItems: 'center',
  fontFamily: 'var(--mono)',
  fontSize: 9,
  letterSpacing: '.16em',
  color: 'var(--dim)',
};
const headline2: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  lineHeight: 1.35,
  color: 'var(--txt)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};
const metaRow: CSSProperties = {
  marginTop: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
  fontFamily: 'var(--mono)',
  fontSize: 8.5,
  color: 'var(--dim)',
};
