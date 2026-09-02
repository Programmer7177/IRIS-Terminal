import { getAllSourceStatus } from '@/lib/sourceStatus';
import { getSupabase } from '@/lib/supabase/server';
import { ENABLED_SOURCE_COUNT } from '@/lib/sources';
import type { FeedHealth } from '@/components/shell/StatusFooter';

/**
 * Powers the rail footer and `/api/health`.
 *
 * Deliberately not a `defineFeature` — there is no mock variant. When nothing is
 * reporting, the honest answer is `0/14`, not a fabricated `14/14`.
 */
export async function getFeedHealth(): Promise<FeedHealth> {
  const statuses = await getAllSourceStatus();
  const rows = [...statuses.values()];

  const enabled = rows.length > 0 ? rows.filter((r) => r.is_enabled).length : ENABLED_SOURCE_COUNT;
  const liveRows = rows.filter((r) => r.is_enabled && r.mode === 'live');
  const successes = rows
    .map((r) => r.last_success_at)
    .filter((v): v is string => Boolean(v))
    .sort();

  const model = await getActiveModel();

  return {
    live: liveRows.length,
    enabled,
    lastSyncAt: successes.length > 0 ? successes[successes.length - 1] : null,
    modelName: model.name,
    modelVersion: model.version,
    modelIsPlaceholder: model.isPlaceholder,
  };
}

async function getActiveModel(): Promise<{ name: string; version: string; isPlaceholder: boolean }> {
  const fallback = { name: 'weekly_regime', version: 'v0-placeholder', isPlaceholder: true };
  const sb = getSupabase();
  if (!sb) return fallback;
  try {
    const { data, error } = await sb
      .from('model_registry')
      .select('model_name, model_version, is_placeholder')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (error || !data) return fallback;
    return {
      name: data.model_name as string,
      version: data.model_version as string,
      isPlaceholder: data.is_placeholder as boolean,
    };
  } catch {
    return fallback;
  }
}

/** A feed is considered stale once nothing has succeeded for five minutes. */
export function isStale(lastSyncAt: string | null, now = Date.now()): boolean {
  if (!lastSyncAt) return true;
  const t = Date.parse(lastSyncAt);
  return !Number.isFinite(t) || now - t > 5 * 60 * 1000;
}
