import { fmtDayMonth } from '@/lib/format';
import type { GeopoliticalEvent } from './types';

export function toEventLabel(event: GeopoliticalEvent) {
  return {
    country: event.country,
    type: event.eventType,
    sentiment: event.sentiment,
    headline: event.headline,
    date: fmtDayMonth(event.date),
  };
}

export function getEventColor(sentiment: string): string {
  if (sentiment === 'positive') return 'var(--up)';
  if (sentiment === 'negative') return 'var(--down)';
  return 'var(--mut)';
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  regulatory: 'var(--mut)',
  conflict: 'var(--down)',
  macro: 'var(--mut)',
  infrastructure: 'var(--up)',
};
