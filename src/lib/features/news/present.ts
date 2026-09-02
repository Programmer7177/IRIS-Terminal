import type { NewsArticle } from './types';

export function toNewsLabel(article: NewsArticle) {
  return {
    title: article.title,
    source: article.source,
    sentiment: article.sentiment,
    btcWindow: article.btcWindow,
  };
}

export function getNewsSentimentColor(sentiment: string): string {
  if (sentiment === 'positive') return 'var(--up)';
  if (sentiment === 'negative') return 'var(--down)';
  return 'var(--mut)';
}
