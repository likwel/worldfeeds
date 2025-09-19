"use client";
import { useState } from "react";
import { Home, Image, FileText, Info, Code, Menu, X, Video, Settings, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { nanoid } from "nanoid";
// import { SidebarContentFilter} from "./CategoryFilter";
import SidebarServer from "./SidebarServer";
import { prisma } from "@/lib/db"; // ton client Prisma

export default function ArticlesList({ items, total, q, source, page }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  const sources = [
    { key: "all", label: "Toutes les sources" },
    { key: "France 24", label: "France 24" },
    { key: "CNN World", label: "CNN World" },
    { key: "BBC World", label: "BBC World" },
    { key: "Al Jazeera", label: "Al Jazeera" },
    { key: "The Guardian", label: "The Guardian" },
    { key: "NY Times World", label: "NY Times World" },
    { key: "DW World", label: "DW World" }
  ];

  const links = [
    { href: "/", label: "Accueil", icon: <Home size={20} /> },
    { href: "/videos", label: "Videos", icon: <Video size={20} /> },
    { href: "/images", label: "Images", icon: <Image size={20} /> },
    { href: "/articles", label: "Articles", icon: <FileText size={20} /> },
    { href: "/api", label: "API", icon: <Code size={20} /> },
    { href: "/setting", label: "Paramètre", icon: <Settings size={20} /> },
    { href: "/about", label: "À propos", icon: <Info size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent links={links} />
        <SidebarServer />
      </aside>

      <main className="flex-1 flex flex-col overflow-auto">
        {/* Navbar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex flex-col gap-3 z-10">
          <div className="flex justify-between items-center gap-2">
            {/* Sidebar Mobile */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-xl bg-white outline-1 outline-gray-300 hover:bg-gray-200 cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              {sidebarOpen && (
                <aside className="absolute z-40 top-20 left-0 w-64 h-full bg-white shadow-lg flex flex-col transition-transform duration-300">
                  <SidebarContent links={links} closeSidebar={() => setSidebarOpen(false)} />
                </aside>
              )}
            </div>

            {/* Formulaire + icônes */}
            <form className="flex flex-1 gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher…"
                className="flex-1 rounded-xl bg-gray-50 px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <button className="rounded-xl bg-light-600 outline-1 outline-gray-300 text-gray px-3 py-2 hover:bg-gray-300 hover:border hover:text-white cursor-pointer">
                🔍
              </button>
            </form>

            <div className="ms-5 flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                <Bell size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                <User size={20} />
              </button>
            </div>
          </div>

          {/* Tabs Source */}
          <div className="flex flex-wrap gap-3">
            {sources.map((s) => {
              const isActive = s.key === source;
              const url = `/?q=${q}&source=${s.key}&page=1`;
              return (
                <a
                  key={s.key}
                  href={url}
                  className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="p-6">
          {q && (
            <p className="mb-4 text-gray-600 text-sm">
              🔎 Résultats proposés pour : <span className="font-semibold">{q}</span>
            </p>
          )}
          {items.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a: any) => (
                <li
                  key={nanoid()}
                  className="rounded-xl bg-white shadow hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative">
                      <img
                        src={
                          a.enclosureUrl
                            ? a.enclosureUrl
                            : a.thumbnail
                            ? a.thumbnail
                            : a.imageUrl
                            ? a.imageUrl
                            : `https://picsum.photos/seed/${encodeURIComponent(a.title)}//400/300`
                        }
                        alt={a.title || `Preview de l'article`}
                        className="h-48 w-full object-cover"
                      />

                      {/* 🏷️ Source en haut à gauche (mise en évidence) */}
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        {a.source}
                      </span>

                      {/* 🏷️ Badges catégories en haut à droite */}
                      {a.categories && a.categories.length > 0 && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                          {(typeof a.categories === "string" ? a.categories.split(",") : a.categories)
                            .slice(0, 1) // 🔹 Limite à 2 catégories
                            .map((cat: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow"
                              >
                                {cat.trim()}
                              </span>
                            ))}

                            {/* 🔹 Indique s'il y a d'autres catégories non affichées */}
                            {(typeof a.categories === "string" ? a.categories.split(",") : a.categories).length > 1 && (
                              <span
                                className="bg-gray-300 text-gray-800 text-xs font-medium px-2 py-1 rounded-full shadow cursor-help"
                                title={(typeof a.categories === "string" ? a.categories.split(",") : a.categories)
                                  .slice(1)
                                  .join(", ")}
                              >
                                +{(typeof a.categories === "string" ? a.categories.split(",") : a.categories).length - 1}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="p-4">
                      <h2 className="text-lg font-semibold line-clamp-2 hover:underline">
                        {a.title}
                      </h2>
                      <div className="mt-1 text-sm text-gray-500">
                        {/* Source en priorité */}
                        <span className="inline-block bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-md font-medium">{a.creator ? a.creator : a.source}</span>
                        {a.publishedAt && (
                          <>
                            {" • "}
                            {new Date(a.publishedAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                        {a.summary ? a.summary : "Résumé indisponible pour cet article."}
                      </p>
                    </div>
                  </a>
                </li>
              ))}

            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FileText size={200} className="mb-4" />
              <p className="text-lg font-medium">Aucun résultat trouvé</p>
            </div>
          )}

          {/* Pagination intelligente */}
          {totalPages > 1 && items.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {/* Bouton précédent */}
              <a
                href={`/?q=${q}&source=${source}&page=${page > 1 ? page - 1 : 1}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                ⬅ Précédent
              </a>

              {/* Pages */}
              {(() => {
                const pages: (number | string)[] = [];
                const firstPages = [1, 2, 3, 4, 5];
                const lastPages = Array.from(
                  { length: 5 },
                  (_, i) => totalPages - 4 + i
                ).filter((p) => p > 5);

                const surrounding = [page - 1, page, page + 1].filter(
                  (p) => p > 5 && p < totalPages - 4
                );

                // Ajouter les 5 premières pages
                pages.push(...firstPages);

                // Ajouter "..." si besoin avant les pages autour de l'actuelle
                if (surrounding.length && surrounding[0] > 6) pages.push("...");

                // Ajouter les pages autour de l'actuelle
                pages.push(...surrounding);

                // Ajouter "..." si besoin avant les 5 dernières pages
                if (lastPages.length && (surrounding.at(-1) ?? 5) < totalPages - 5) {
                  pages.push("...");
                }

                // Ajouter les 5 dernières pages
                pages.push(...lastPages);

                return pages.map((p, idx) =>
                  typeof p === "string" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <a
                      key={p}
                      href={`/?q=${q}&source=${source}&page=${p}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {p}
                    </a>
                  )
                );
              })()}

              {/* Bouton suivant */}
              <a
                href={`/?q=${q}&source=${source}&page=${page < totalPages ? page + 1 : totalPages}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Suivant ➡
              </a>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function SidebarContent({ links, closeSidebar }: { links: any[]; closeSidebar?: () => void }) {
  // const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const pathname = usePathname();
  return (
    <>
      <h2 className="p-4 text-2xl font-bold">🌐 {process.env.NEXT_PUBLIC_SITE_NAME ?? "WorldFeeds"}</h2>
      <nav className="px-4 flex flex-col gap-2 bg-white">
        {links.map((l) => {
          const isActive = pathname === l.href;
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-900"
              }`}
            >
              {l.icon} {l.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
