// app/api/categories/route.ts
import { prisma } from "@/lib/db";

export async function GET() {
  const cats = await prisma.article.findMany({
    select: { categories: true },
  });

  const allCategories = Array.from(
    new Set(
      cats
        .map(a => a.categories?.split(",") ?? [])
        .flat()
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0)
    )
  );

  return new Response(JSON.stringify(allCategories), {
    headers: { "Content-Type": "application/json" },
  });
}
