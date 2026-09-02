import { seeded, pick } from '@/lib/rng';
import type { NewsArticle, NewsArgs } from './types';

const DUMMY_ARTICLES = [
  { title: 'Bitcoin Reaches New Milestone in Adoption', source: 'CryptoPanic', sentiment: 'positive' as const },
  { title: 'Regulatory Pressure on Crypto Markets Intensifies', source: 'Reuters', sentiment: 'negative' as const },
  { title: 'Major Institution Eyes Bitcoin Holdings', source: 'Bloomberg', sentiment: 'positive' as const },
  { title: 'Volatility Spikes on Market Uncertainty', source: 'CNBC', sentiment: 'negative' as const },
  { title: 'Developer Activity Continues to Grow', source: 'CoinGecko', sentiment: 'neutral' as const },
];

export function mockNews({ limit = 5 }: NewsArgs): NewsArticle[] {
  const r = seeded('news');
  
  const articles: NewsArticle[] = [];
  for (let i = 0; i < Math.min(limit, DUMMY_ARTICLES.length); i++) {
    const article = DUMMY_ARTICLES[i];
    articles.push({
      ...article,
      btcWindow: `${10 + i * 5} hours`,
    });
  }
  
  return articles;
}
