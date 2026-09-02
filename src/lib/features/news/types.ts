export interface NewsArticle {
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  btcWindow: string;
  url?: string;
}

export interface NewsArgs {
  limit?: number;
}
