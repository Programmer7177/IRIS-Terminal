import { seeded, pick } from '@/lib/rng';
import type { GeopoliticalEvent, GeopoliticalEventsArgs } from './types';

const DUMMY_EVENTS = [
  { country: 'US', eventType: 'macro' as const, sentiment: 'negative' as const, headline: 'Federal Reserve Signals Higher Rates' },
  { country: 'EU', eventType: 'regulatory' as const, sentiment: 'negative' as const, headline: 'MiCA Regulation Enforcement Begins' },
  { country: 'China', eventType: 'regulatory' as const, sentiment: 'negative' as const, headline: 'Beijing Tightens Crypto Controls' },
  { country: 'Japan', eventType: 'infrastructure' as const, sentiment: 'positive' as const, headline: 'Bitcoin Mining Expansion Approved' },
  { country: 'UK', eventType: 'macro' as const, sentiment: 'neutral' as const, headline: 'BoE Reviews Digital Asset Policy' },
];

export function mockGeopoliticalEvents({ limit = 5 }: GeopoliticalEventsArgs): GeopoliticalEvent[] {
  const r = seeded('geo_events');
  
  const events: GeopoliticalEvent[] = [];
  for (let i = 0; i < Math.min(limit, DUMMY_EVENTS.length); i++) {
    const event = DUMMY_EVENTS[i];
    events.push({
      ...event,
      date: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  
  return events;
}
