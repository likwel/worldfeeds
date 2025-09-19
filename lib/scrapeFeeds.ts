import Parser from "rss-parser";
import fetch from "node-fetch";
import { load } from "cheerio";
import { FEEDS } from "@/lib/feeds";

async function getOgImage(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = load(html);

    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");

    return ogImage || null;
  } catch (e) {
    console.error("Erreur récupération image:", e);
    return null;
  }
}

type FeedItem = {
  source: string;
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  creator?: string;
  enclosure?: { url?: string; type?: string; length?: string };
  thumbnail?: string;
  categories?: string[];
  image?: string | null;
};

export async function scrapeFeeds(
  q?: string,
  source?: string
): Promise<FeedItem[]> {
  const parser = new Parser({
    customFields: {
      item: [
        ["media:thumbnail", "media:thumbnail", { keepArray: false }],
        ["dc:creator", "dc:creator", { keepArray: false }],
        ["category", "category", { keepArray: true }],
      ],
    },
  });

  let results: FeedItem[] = [];

  for (const feed of FEEDS) {
    if (source && source !== "all" && feed.name !== source) continue;

    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items) {
        const enclosure = item.enclosure
          ? {
              url: item.enclosure.url ?? undefined,
              type: item.enclosure.type ?? undefined,
              length: item.enclosure.length ?? undefined,
            }
          : undefined;

        let ogImage = null;
        if (!enclosure && !(item as any)["media:thumbnail"]?.url) {
          ogImage = await getOgImage(item.link);
        }

        results.push({
          source: feed.name,
          title: item.title ?? "",
          link: item.link ?? "",
          description: item.contentSnippet ?? item.content ?? item.summary,
          pubDate: item.pubDate,
          creator: (item as any)["dc:creator"],
          enclosure,
          thumbnail: (item as any)["media:thumbnail"]?.url,
          categories: Array.isArray(item.category)
            ? item.category
            : item.category
            ? [item.category]
            : undefined,
          image: ogImage,
        });
      }
    } catch (err) {
      console.error(`Erreur lors du parsing de ${feed.name}:`, err);
    }
  }

  // Filtre recherche
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }

  // Trier par date
  results.sort((a, b) => {
    if (a.pubDate && b.pubDate) {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    }
    return 0;
  });

  return results;
}
