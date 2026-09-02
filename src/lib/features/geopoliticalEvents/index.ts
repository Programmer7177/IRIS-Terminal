import { defineFeature } from '@/lib/defineFeature';
import { fetchGeopoliticalEvents } from './live';
import { mockGeopoliticalEvents } from './mock';
import type { GeopoliticalEvent, GeopoliticalEventsArgs } from './types';

export const getGeopoliticalEvents = defineFeature<GeopoliticalEventsArgs, GeopoliticalEvent[]>({
  key: 'geopolitical_events',
  source: 'rss',
  live: fetchGeopoliticalEvents,
  mock: mockGeopoliticalEvents,
});

export type { GeopoliticalEvent, GeopoliticalEventsArgs };
export { toEventLabel, getEventColor, EVENT_TYPE_COLORS } from './present';
