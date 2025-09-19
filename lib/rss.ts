import Parser from "rss-parser";
import crypto from "crypto";

const parser = new Parser({
    customFields: {
        item: ["image", ["media:thumbnail", "media:content"]],
    },
});


export type NormalizedItem = {
    uniqueId: string;
    source: string;
    title: string;
    link: string;
    summary?: string;
    imageUrl?: string;
    publishedAt: Date;
};

function pickImage(item: any): string | undefined {
    // Try common media fields
    const media = (item["media:content"] ?? item["media:thumbnail"]) as
        | { $: { url?: string } }
        | { url?: string }
        | undefined;
    if (Array.isArray(media)) {
        const m = media.find(Boolean) as any;
        return m?.$?.url ?? m?.url;
    }
    return (media as any)?.$?.url ?? (media as any)?.url ?? item?.enclosure?.url;
}


export async function fetchAndNormalizeFeed(name: string, url: string) {
    const feed = await parser.parseURL(url);
    const items: NormalizedItem[] = (feed.items ?? []).map((it) => {
        const link = it.link || "";
        const guid = it.guid || link || `${name}-${it.title}-${it.isoDate}`;
        const uniqueId = crypto
            .createHash("sha256")
            .update(`${name}:${guid}`)
            .digest("hex");


        const publishedAt = it.isoDate
            ? new Date(it.isoDate)
            : it.pubDate
                ? new Date(it.pubDate)
                : new Date();


        return {
            uniqueId,
            source: name,
            title: it.title ?? "(Sans titre)",
            link,
            summary: it.contentSnippet || it.content || it.summary || undefined,
            imageUrl: pickImage(it),
            publishedAt,
        };
    });
    return items;
}