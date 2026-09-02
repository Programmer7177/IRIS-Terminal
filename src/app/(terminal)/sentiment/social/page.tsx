import { getSentiment } from '@/lib/features/sentiment';
import { getFearGreed } from '@/lib/features/fearGreed';
import { FearGreedGauge } from '@/components/features/social/FearGreedGauge';
import { SentimentDistribution } from '@/components/features/social/SentimentDistribution';

export const revalidate = 30;

export default async function SocialSentimentPage() {
  const [sentiment, fearGreed] = await Promise.all([getSentiment({ days: 7 }), getFearGreed({})]);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <FearGreedGauge fearGreed={fearGreed} />
      <SentimentDistribution sentiment={sentiment} />
    </div>
  );
}
