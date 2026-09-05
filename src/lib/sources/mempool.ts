/**
 * mempool.space — keyless Bitcoin network telemetry.
 *
 * No key, no approval. Covers five things the terminal had no source for at all:
 * transaction fees, mempool congestion, the difficulty retarget, hashrate
 * history, and mining pool distribution.
 *
 * One honesty note that belongs on every panel built from this: these are the
 * readings of *one node*. The mempool is not a global object — another node with
 * different relay policy or uptime sees a different backlog. These are
 * mempool.space's figures, not "the" mempool's.
 *
 * All functions throw on a non-2xx, a timeout, or a response that does not parse
 * to the expected shape. `defineFeature` catches that and falls back to the
 * badged mock layer.
 *
 * Docs: https://mempool.space/docs/api/rest
 */
import { fetchJson } from './http';

const BASE = 'https://mempool.space/api';

/** Hashes per second -> exahashes per second. */
const toEhs = (hps: number) => hps / 1e18;

const finite = (v: unknown, what: string): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`mempool.space: non-finite ${what}`);
  return n;
};

/* ------------------------------------------------------------------ fees -- */

/** Recommended fee rates in sat/vB. */
export interface MempoolFees {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
}

export async function getRecommendedFees(): Promise<MempoolFees> {
  const j = await fetchJson<Record<string, unknown>>(`${BASE}/v1/fees/recommended`, {
    revalidate: 120,
  });
  return {
    fastest: finite(j.fastestFee, 'fastestFee'),
    halfHour: finite(j.halfHourFee, 'halfHourFee'),
    hour: finite(j.hourFee, 'hourFee'),
    economy: finite(j.economyFee, 'economyFee'),
    minimum: finite(j.minimumFee, 'minimumFee'),
  };
}

/* --------------------------------------------------------------- mempool -- */

/** One fee-rate band and the pending weight sitting in it. */
export interface FeeBucket {
  /** Inclusive lower bound in sat/vB. */
  from: number;
  /** Exclusive upper bound; `null` on the open-ended top band. */
  to: number | null;
  label: string;
  vsize: number;
}

export interface MempoolState {
  txCount: number;
  /** Total virtual size of the backlog, in vBytes. */
  vsize: number;
  totalFeeSat: number;
  /** Backlog in whole blocks — the readable form of `vsize`. */
  blocksToClear: number;
  buckets: FeeBucket[];
}

/**
 * Fee-rate bands.
 *
 * The upstream histogram is a long list of fine-grained `[feeRate, vsize]` pairs
 * whose boundaries shift with demand — plotting it raw produces a chart whose
 * bars mean something different on every load. Fixed bands are comparable over
 * time, which is the only reason to look at the histogram at all.
 */
const BANDS: { from: number; to: number | null; label: string }[] = [
  { from: 0, to: 2, label: '<2' },
  { from: 2, to: 4, label: '2-4' },
  { from: 4, to: 8, label: '4-8' },
  { from: 8, to: 15, label: '8-15' },
  { from: 15, to: 30, label: '15-30' },
  { from: 30, to: 60, label: '30-60' },
  { from: 60, to: null, label: '60+' },
];

/** Bucket a raw `[feeRate, vsize][]` histogram into `BANDS`. Exported for tests. */
export function bucketFeeHistogram(histogram: unknown): FeeBucket[] {
  const buckets: FeeBucket[] = BANDS.map((b) => ({ ...b, vsize: 0 }));
  if (!Array.isArray(histogram)) return buckets;

  for (const entry of histogram) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const rate = Number(entry[0]);
    const vsize = Number(entry[1]);
    if (!Number.isFinite(rate) || !Number.isFinite(vsize) || vsize <= 0) continue;

    const idx = buckets.findIndex((b) => rate >= b.from && (b.to === null || rate < b.to));
    // A negative rate cannot land in a band. Drop it rather than folding it into
    // the bottom bucket, where it would overstate cheap backlog.
    if (idx >= 0) buckets[idx].vsize += vsize;
  }
  return buckets;
}

/** Virtual size of one block. The backlog reads better in blocks than in vBytes. */
const BLOCK_VSIZE = 1_000_000;

export async function getMempoolState(): Promise<MempoolState> {
  const j = await fetchJson<Record<string, unknown>>(`${BASE}/mempool`, { revalidate: 120 });
  const vsize = finite(j.vsize, 'mempool vsize');
  return {
    txCount: finite(j.count, 'mempool count'),
    vsize,
    totalFeeSat: finite(j.total_fee, 'mempool total_fee'),
    blocksToClear: vsize / BLOCK_VSIZE,
    buckets: bucketFeeHistogram(j.fee_histogram),
  };
}

/* ------------------------------------------------------------ difficulty -- */

export interface DifficultyAdjustment {
  /** How far through the current 2016-block epoch, 0-100. */
  progressPct: number;
  /** Estimated change at the next retarget, in percent. Signed. */
  changePct: number;
  /** The change that actually happened at the previous retarget, in percent. */
  previousChangePct: number;
  remainingBlocks: number;
  remainingMs: number;
  /** ISO 8601. */
  estimatedRetargetAt: string;
  nextRetargetHeight: number;
  /** Mean seconds between blocks this epoch. 600 is the target. */
  blockTimeAvgSec: number;
}

export async function getDifficultyAdjustment(): Promise<DifficultyAdjustment> {
  const j = await fetchJson<Record<string, unknown>>(`${BASE}/v1/difficulty-adjustment`, {
    revalidate: 600,
  });
  const retargetMs = finite(j.estimatedRetargetDate, 'estimatedRetargetDate');
  return {
    progressPct: finite(j.progressPercent, 'progressPercent'),
    changePct: finite(j.difficultyChange, 'difficultyChange'),
    previousChangePct: finite(j.previousRetarget, 'previousRetarget'),
    remainingBlocks: finite(j.remainingBlocks, 'remainingBlocks'),
    remainingMs: finite(j.remainingTime, 'remainingTime'),
    estimatedRetargetAt: new Date(retargetMs).toISOString(),
    nextRetargetHeight: finite(j.nextRetargetHeight, 'nextRetargetHeight'),
    blockTimeAvgSec: finite(j.timeAvg, 'timeAvg') / 1000,
  };
}

/* -------------------------------------------------------------- hashrate -- */

export interface HashratePoint {
  /** Milliseconds since epoch. */
  ts: number;
  /** EH/s. */
  ehs: number;
}

export interface HashrateSeries {
  points: HashratePoint[];
  currentEhs: number;
  currentDifficulty: number;
}

/** Daily average hashrate over the last three months, plus the current reading. */
export async function getHashrateSeries(): Promise<HashrateSeries> {
  const j = await fetchJson<Record<string, unknown>>(`${BASE}/v1/mining/hashrate/3m`, {
    revalidate: 3600,
  });

  const raw = Array.isArray(j.hashrates) ? (j.hashrates as Record<string, unknown>[]) : [];
  const points: HashratePoint[] = [];
  for (const p of raw) {
    const ts = Number(p?.timestamp);
    const hps = Number(p?.avgHashrate);
    if (!Number.isFinite(ts) || !Number.isFinite(hps) || hps <= 0) continue;
    points.push({ ts: ts * 1000, ehs: toEhs(hps) });
  }
  if (points.length === 0) throw new Error('mempool.space: empty hashrate series');
  points.sort((a, b) => a.ts - b.ts);

  return {
    points,
    currentEhs: toEhs(finite(j.currentHashrate, 'currentHashrate')),
    currentDifficulty: finite(j.currentDifficulty, 'currentDifficulty'),
  };
}

/* ----------------------------------------------------------------- pools -- */

export interface MiningPool {
  name: string;
  slug: string;
  link: string | null;
  blockCount: number;
  /** Share of blocks mined in the window, 0-100. */
  sharePct: number;
}

/**
 * Pool distribution over the last week.
 *
 * Attribution is a coinbase-tag heuristic, not a proof. Blocks whose tag matches
 * nothing known are reported under an "Unknown" pool — that bucket is a real
 * measurement of unattributed hashrate, not a gap in the data, so it is kept
 * rather than filtered out.
 */
export async function getMiningPools(): Promise<MiningPool[]> {
  const j = await fetchJson<Record<string, unknown>>(`${BASE}/v1/mining/pools/1w`, {
    revalidate: 3600,
  });

  const total = Number(j.blockCount);
  const raw = Array.isArray(j.pools) ? (j.pools as Record<string, unknown>[]) : [];

  const pools: MiningPool[] = [];
  for (const p of raw) {
    const blockCount = Number(p?.blockCount);
    const name = typeof p?.name === 'string' ? p.name : '';
    if (!name || !Number.isFinite(blockCount)) continue;
    pools.push({
      name,
      slug: typeof p?.slug === 'string' ? p.slug : name.toLowerCase().replace(/\s+/g, '-'),
      link: typeof p?.link === 'string' && p.link ? p.link : null,
      blockCount,
      sharePct: Number.isFinite(total) && total > 0 ? (blockCount / total) * 100 : 0,
    });
  }
  if (pools.length === 0) throw new Error('mempool.space: empty pool list');

  return pools.sort((a, b) => b.blockCount - a.blockCount);
}
