# Data Manifest

Per-feature map of **variable name → database column → real source → what is
needed to unlock it**.

`Status` legend:
- **LIVE** — real data in the database
- **MOCK** — rendered from `src/lib/features/<feature>/mock.ts`, badged in the UI
- **EMPTY** — table exists, no writer yet, intentionally

The source of truth for `Status` is the `data_source_status` table, not this
file. This file explains *why*.

> Phase 0 status: the schema does not exist yet, so **everything is MOCK**.
> Sections are filled in per feature as Phase 2 builds each data access module.

## Blocked features — decisions required

| Feature | Why blocked | Options | Cost | Recommendation |
|---|---|---|---|---|
| Entity holdings (Arkham) | The official API at `docs.intel.arkm.com` requires access approval. Scraping the site is prohibited by its terms and would break on every frontend change — we will not do it. | (a) apply for API access, (b) drop the panel, (c) substitute public ETF flow data | unknown | Apply; ship the panel MOCK meanwhile |
| Hot vs cold wallet split | Not raw on-chain data. It is the output of proprietary address clustering (Glassnode, CryptoQuant) and is paywalled. | (a) pay for a provider, (b) ship the aggregate exchange-netflow proxy | ~$29–800/mo | Ship the proxy, labelled `PROXY`; keep `btc_wallet_flow` empty and ready |
| Live tweets | X API pricing, TwitterAPI.io per-call billing, Nitter instance reliability (>50% downtime over the last year) | `TWEET_SOURCE=twitterapi_io \| nitter \| mock` | ~$0.15 / 1k tweets | Start on `mock`, switch after a budget decision |
| News source | CryptoPanic vs plain RSS vs X API | CryptoPanic developer plan is free with a key | free | CryptoPanic with an RSS fallback |
| Macro: Indonesia | FRED coverage for ID is effectively absent for most of the eight indicators | BPS API, Trading Economics, or a manual CSV | — | Mark ID as MOCK. Do not fill the tab with plausible-looking numbers. |
| On-chain metrics (MVRV, SOPR, NUPL, hash rate…) | No free provider covers this set reliably | paid on-chain data subscription | varies | MOCK until a provider is chosen |

## Keys to register

| Source | Registration | Free? | Env var |
|---|---|---|---|
| Coinbase Exchange (candles) | no | yes | — |
| yfinance (daily history) | no | yes | — |
| alternative.me (Fear & Greed) | no | yes | — |
| CoinGecko (market cap, dominance) | yes, 2 min | demo tier | `COINGECKO_API_KEY` |
| FRED (macro) | yes, instant | yes | `FRED_API_KEY` |
| CryptoPanic (news) | yes | dev tier free | `CRYPTOPANIC_TOKEN` |
| TwitterAPI.io (tweets) | yes | no, ~$0.00015/read | `TWITTERAPI_IO_KEY` |
| Arkham Intel | yes, approval required | unknown | `ARKHAM_KEY` |
