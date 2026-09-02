# Architecture

Three processes, deliberately separated.

```
Python worker  ──service_role──▶  Supabase Postgres  ──anon read──▶  Next.js
(APScheduler)                     RLS: public read                   (Vercel)
pandas / numpy                    service writes only                App Router, SSR
```

## Why not Streamlit + SQLite

The visual reference (`../IRIS BTC Terminal v4.local.html`) is a dense terminal
layout with a custom navigation rail, a 1px-gutter panel grid and micro
typography. Streamlit imposes its own layout and cannot produce it. SQLite is
also unusable here: the dashboard is serverless (ephemeral filesystem) and the
writer is a separate process.

The planning spec already required "scheduler separate from dashboard" and
"easy to migrate to Postgres when it scales". This starts at Postgres.

## Why the worker stays Python

Monte Carlo, the indicator pipeline and the news classifier are all pandas /
numpy / scikit-learn work, and the feature engineering must be *the same code*
in training and in serving. Rewriting that in TypeScript to fit the frontend
would guarantee drift between the two paths.

## Process boundaries

| Process | Reads | Writes | Runs |
|---|---|---|---|
| `worker/` | upstream APIs | every data table, `data_source_status` | locally now; a Railway/Fly worker later, unchanged |
| Next.js | every data table (anon) | nothing | Vercel |

The worker is 12-factor: configuration is environment variables only, so moving
it to a container is "set the same variables and run `python -m iris_worker.scheduler`".

## The mock contract

Every panel receives an `Envelope<T>`, never a bare value. `defineFeature`
resolves a feature to live data when it exists and placeholder data when it does
not, and records which happened. Components import neither `live.ts` nor
`mock.ts` — an ESLint rule enforces that — so there is exactly one way for
synthetic data to reach a pixel, and it always arrives wearing a MOCK badge.

See `DATA_MANIFEST.md` for the per-feature variable → source → unlock table.
