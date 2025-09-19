// app/components/SidebarServer.tsx
import { prisma } from "@/lib/db";
import { SidebarContentFilter } from "./CategoryFilter";

export default async function SidebarServer() {
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

  const categories = allCategories.map(cat => ({ id: cat, name: cat }));

  return <SidebarContentFilter categories={categories} />;
}
