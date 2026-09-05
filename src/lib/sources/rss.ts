/**
 * Crypto news via public RSS. Keyless. Every feed here returns RSS 2.0 with the
 * usual `<item><title><link><pubDate>` shape; a few wrap text in CDATA, which the
 * parser below unwraps.
 *
 * No XML dependency: RSS item structure is regular enough that a scoped regex is
 * more robust here than pulling in a parser that also has to handle Atom,
 * namespaces, and malformed HTML.
 */
import { fetchText } from './http';

export interface RssItem {
  title: string;
  link: string;
  publishedAt: number; // ms epoch; 0 when the feed omitted a usable date
  source: string;
  /** First paragraph of the item body, tags stripped, capped. '' when absent. */
  description: string;
}

export interface FeedDef {
  source: string;
  url: string;
}

/** Feeds verified keyless and un-blocked from a datacentre IP. */
export const FEEDS: FeedDef[] = [
  { source: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
  { source: 'Decrypt', url: 'https://decrypt.co/feed' },
  { source: 'NewsBTC', url: 'https://www.newsbtc.com/feed/' },
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss' },
];

function unwrap(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : null;
}

function parseFeed(xml: string, source: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const rawTitle = tag(block, 'title');
    const rawLink = tag(block, 'link');
    const rawDate = tag(block, 'pubDate') ?? tag(block, 'dc:date') ?? tag(block, 'published');
    const rawDesc =
      tag(block, 'description') ?? tag(block, 'content:encoded') ?? tag(block, 'summary');
    if (!rawTitle) continue;
    const parsed = rawDate ? Date.parse(unwrap(rawDate)) : NaN;
    const desc = rawDesc ? unwrap(rawDesc).replace(/\s+/g, ' ').trim() : '';
    items.push({
      title: unwrap(rawTitle),
      link: rawLink ? unwrap(rawLink) : '',
      publishedAt: Number.isFinite(parsed) ? parsed : 0,
      source,
      description: desc.length > 320 ? `${desc.slice(0, 317)}...` : desc,
    });
  }
  return items;
}

/**
 * Fetch every feed, merge, drop dupes by title, newest first. One slow or dead
 * feed does not sink the batch — its rejection is swallowed and the rest stand.
 */
export async function getCryptoNews(perFeedLimit = 15): Promise<RssItem[]> {
  const settled = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const xml = await fetchText(f.url, { revalidate: 600 });
      return parseFeed(xml, f.source).slice(0, perFeedLimit);
    }),
  );

  const seen = new Set<string>();
  const merged: RssItem[] = [];
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      const k = item.title.toLowerCase().replace(/\s+/g, ' ').slice(0, 120);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(item);
    }
  }
  return merged.sort((a, b) => b.publishedAt - a.publishedAt);
}
