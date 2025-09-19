import { NextRequest, NextResponse } from "next/server";
import { FEEDS } from "@/lib/feeds";
import { fetchAndNormalizeFeed } from "@/lib/rss";
import { prisma } from "@/lib/db";


export const runtime = "nodejs"; // ensure Node runtime (not edge)


export async function POST(req: NextRequest) {
    const token = req.headers.get("x-ingest-token");
    if (!token || token !== process.env.INGEST_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    let inserted = 0;
    for (const f of FEEDS) {
        const items = await fetchAndNormalizeFeed(f.name, f.url);
        for (const it of items) {
            try {
                await prisma.article.upsert({
                    where: { uniqueId: it.uniqueId },
                    create: {
                        uniqueId: it.uniqueId,
                        source: it.source,
                        title: it.title,
                        link: it.link,
                        summary: it.summary,
                        imageUrl: it.imageUrl,
                        publishedAt: it.publishedAt,
                    },
                    update: { // optional refresh of fields
                        title: it.title,
                        summary: it.summary,
                        imageUrl: it.imageUrl,
                        publishedAt: it.publishedAt,
                    },
                });
                inserted++;
            } catch (e) {
                // ignore individual failures; continue
            }
        }
    }


    return NextResponse.json({ ok: true, inserted });
}