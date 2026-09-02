import { Panel, PanelHeader, Tag, MockBadge, SourceFootnote } from '@/components/primitives';
import type { Envelope } from '@/lib/envelope';
import type { SentimentData } from '@/lib/features/sentiment';
import type { NewsArticle } from '@/lib/features/news';
import { fmtAgo } from '@/lib/format';
import { type Tone } from '@/lib/theme/tokens';

export interface IntelligenceFeedProps {
  sentiment: Envelope<SentimentData>;
  news: Envelope<NewsArticle[]>;
}

function getSentimentTone(score: number): Tone {
  if (score > 0.5) return 'up';
  if (score < -0.5) return 'down';
  return 'txt';
}

function getSentimentLabel(sentiment: string): string {
  if (sentiment === 'positive') return 'BULLISH';
  if (sentiment === 'negative') return 'BEARISH';
  return 'NEUTRAL';
}

export function IntelligenceFeed({
  sentiment,
  news,
}: IntelligenceFeedProps) {
  const sentimentData = sentiment.data;
  const newsArticles = news.data.slice(0, 6); // Limit to 6 items

  // Map overall sentiment to a direction
  const overallSentiment: 'positive' | 'negative' | 'neutral' =
    sentimentData.score > 0.1
      ? 'positive'
      : sentimentData.score < -0.1
        ? 'negative'
        : 'neutral';

  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', minHeight: 300 }}>
      <PanelHeader
        title="LIVE INTELLIGENCE"
        note="Sentiment + News"
        right={<MockBadge env={news} />}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sentiment Summary */}
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--sunk)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--mut)' }}>
              SENTIMENT
            </span>
            <Tag
              label={getSentimentLabel(overallSentiment)}
              tone={overallSentiment === 'positive' ? 'up' : overallSentiment === 'negative' ? 'down' : 'txt'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '8px', color: 'var(--mut)' }}>
                BULLISH
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--up)' }}>
                {(sentimentData.positivePct * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '8px', color: 'var(--mut)' }}>
                NEUTRAL
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--txt)' }}>
                {(sentimentData.neutralPct * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '8px', color: 'var(--mut)' }}>
                BEARISH
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--down)' }}>
                {(sentimentData.negativePct * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {newsArticles.length > 0 ? (
            newsArticles.map((article, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderBottom: i < newsArticles.length - 1 ? '1px solid var(--line)' : 'none',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Left rail: sentiment tag */}
                <div style={{ minWidth: 'fit-content', marginTop: '2px' }}>
                  <Tag
                    label={getSentimentLabel(article.sentiment)}
                    tone={article.sentiment === 'positive' ? 'up' : article.sentiment === 'negative' ? 'down' : 'txt'}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '9px',
                      color: 'var(--txt)',
                      marginBottom: '2px',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                    }}
                  >
                    {article.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      fontFamily: 'var(--mono)',
                      fontSize: '8px',
                      color: 'var(--dim)',
                    }}
                  >
                    <span>{article.source}</span>
                    <span>·</span>
                    <span>{article.btcWindow}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '20px 12px',
                textAlign: 'center',
                color: 'var(--dim)',
                fontFamily: 'var(--mono)',
                fontSize: '9px',
              }}
            >
              No news available
            </div>
          )}
        </div>
      </div>

      <SourceFootnote env={news} />
    </Panel>
  );
}
