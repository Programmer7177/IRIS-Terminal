import { asRow, getSupabase } from '@/lib/supabase/server';
import type { GeopoliticalEvent, GeopoliticalEventsArgs } from './types';

interface RowDb {
  country: string;
  event_type: string;
  sentiment: string;
  headline: string;
  date: string;
}

export async function fetchGeopoliticalEvents({ limit = 5 }: GeopoliticalEventsArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('geopolitical_events')
    .select('country, event_type, sentiment, headline, date')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return {
    data: data.map(d => {
      const row = asRow<RowDb>(d);
      return {
        country: row.country,
        eventType: row.event_type as 'regulatory' | 'conflict' | 'macro' | 'infrastructure',
        sentiment: row.sentiment as 'positive' | 'negative' | 'neutral',
        headline: row.headline,
        date: row.date,
      };
    }),
    asOf: new Date().toISOString(),
    synthetic: false,
  };
}
