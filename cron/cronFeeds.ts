// cronFeeds.ts
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import Parser from "rss-parser";
import fetch from "node-fetch";
import { load } from "cheerio";

const prisma = new PrismaClient();

export const FEEDS = [
  { name: "France 24", url: "https://www.france24.com/fr/rss" },
  { name: "CNN World", url: "http://rss.cnn.com/rss/edition_world.rss" },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "NY Times World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { name: "DW World", url: "https://rss.dw.com/xml/rss-en-all" }
] as const;

async function getOgImage(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = load(html);
    return (
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null
    );
  } catch (e) {
    console.error("Erreur récupération image:", e);
    return null;
  }
}

function generateUniqueId(link: string, pubDate?: string) {
  return crypto.createHash("md5").update(link + (pubDate ?? "")).digest("hex");
}

export async function scrapeAndInsertFeeds(source?: string) {
  const parser = new Parser({
    customFields: {
      item: [
        ["media:thumbnail", "media:thumbnail", { keepArray: false }],
        ["dc:creator", "dc:creator", { keepArray: false }],
        ["category", "category", { keepArray: true }],
        ["media:content", "media:content", { keepArray: true }],
      ],
    },
  });

  for (const feed of FEEDS) {
    if (source && source !== "all" && feed.name !== source) continue;

    console.log(`🔄 Scraping ${feed.name}...`);
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items) {
        // 🔹 Récupérer media:content ou enclosure
        const mediaItems = (item as any)["media:content"];
        const firstMedia = Array.isArray(mediaItems)
          ? mediaItems[0]
          : mediaItems?.url
          ? mediaItems
          : undefined;

        const enclosure = firstMedia
          ? {
              url: firstMedia.url ?? undefined,
              type: firstMedia.type ?? undefined,
              length: firstMedia.length ? String(firstMedia.length) : undefined,
            }
          : item.enclosure
          ? {
              url: item.enclosure.url ?? undefined,
              type: item.enclosure.type ?? undefined,
              length: item.enclosure.length
                ? String(item.enclosure.length)
                : undefined,
            }
          : undefined;

        let ogImage: string | null = null;
        if (!enclosure && !(item as any)["media:thumbnail"]?.url && item.link) {
          ogImage = await getOgImage(item.link);
        }

        const uniqueId = generateUniqueId(item.link ?? "", item.pubDate);
        const exists = await prisma.article.findUnique({ where: { uniqueId } });

        if (!exists) {
          await prisma.article.create({
            data: {
              uniqueId,
              source: feed.name,
              title: item.title ?? "",
              link: item.link ?? "",
              summary: item.contentSnippet ?? item.content ?? item.summary ?? "",
              creator: (item as any)["dc:creator"],
              categories: (() => {
                if (!item.category) return null;

                if (Array.isArray(item.category)) {
                  // On convertit chaque élément en string de manière sécurisée
                  return item.category
                    .map(c => {
                      if (typeof c === "string") return c;
                      if (c && typeof c === "object") {
                        // Certains flux renvoient { _: "nom" }
                        if ("_" in c) return String(c._);
                        // Sinon on prend la première valeur de l'objet
                        return String(Object.values(c)[0] ?? "");
                      }
                      return String(c);
                    })
                    .filter(Boolean) // supprime les vides
                    .join(",");
                }

                // Si c’est une simple string, on renvoie directement
                if (typeof item.category === "string") return item.category;

                // Si c'est un objet unique, on tente de l'extraire
                if (typeof item.category === "object") {
                  if ("_" in item.category) return String(item.category._);
                  return String(Object.values(item.category)[0] ?? "");
                }

                return null;
              })(),
              enclosureUrl: enclosure?.url,
              enclosureType: enclosure?.type,
              enclosureLength: enclosure?.length,
              thumbnail: (item as any)["media:thumbnail"]?.url,
              imageUrl: ogImage ?? (item as any)["media:thumbnail"]?.url ?? enclosure?.url,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            },
          });
          console.log(`✅ Article ajouté: ${item.title}`);
        }
      }
    } catch (err) {
      console.error(`❌ Erreur lors du parsing de ${feed.name}:`, err);
    }
  }
}

// 👇 Exécuter immédiatement au démarrage
console.log("🕐 Premier scrap en cours...");
scrapeAndInsertFeeds("all")
  .then(() => console.log("✅ Premier scrap terminé."))
  .finally(() => prisma.$disconnect());

// 👇 Cron job toutes les heures
cron.schedule("0 * * * *", async () => {
  console.log("🕐 Cron job exécuté toutes les heures...");
  await scrapeAndInsertFeeds("all");
});
