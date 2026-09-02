export type EventType = 'regulatory' | 'conflict' | 'macro' | 'infrastructure';
export type EventSentiment = 'positive' | 'negative' | 'neutral';

export interface GeopoliticalEvent {
  country: string;
  eventType: EventType;
  sentiment: EventSentiment;
  headline: string;
  date?: string;
}

export interface GeopoliticalEventsArgs {
  limit?: number;
}
