import ArticlesList from "./components/ArticleList";
import { prisma } from "@/lib/db"; // ton client Prisma

const PAGE_LIMIT = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; source?: string; page?: string };
}) {

  const q = searchParams?.q || "";
  const source = searchParams?.source || "all";
  const page = parseInt(searchParams?.page ?? "1", 10);
  const categories = searchParams?.category?.split(",") ?? [];

  // 🔹 Générer le filtre Prisma
  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  if (source && source !== "all") {
    whereClause.source = source;
  }

  if (categories.length > 0) {
    whereClause.categories = {
      some: {
        in: categories,
      },
    };
  }

  // 🔹 Récupération totale pour la pagination
  const total = await prisma.article.count({ where: whereClause });

  const cats = await prisma.article.findMany({ 
    select: {
      categories: true, // on récupère seulement les catégories
    },
  });

  // 🔹 Extraction de toutes les catégories uniques
  const allCategories = Array.from(
    new Set(
      cats
        .map(a => a.categories?.split(",") ?? []) // convertir "Politique,Monde" en tableau
        .flat() // aplatir tous les tableaux
        .map(cat => cat.trim()) // nettoyer les espaces
        .filter(cat => cat.length > 0) // enlever les chaînes vides
    )
  );

  // 🔹 Récupération paginée
  const items = await prisma.article.findMany({
    where: whereClause,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  // console.log(allCategories)

  return (
    <ArticlesList
      items={items}
      total={total}
      q={q}
      source={source}
      page={page}
    />
  );
}
