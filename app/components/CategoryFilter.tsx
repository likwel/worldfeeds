"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

interface SidebarContentFilterProps {
  categories: Category[];
}

export function SidebarContentFilter({ categories }: SidebarContentFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) setSelectedCategories(catParam.split(","));
  }, [searchParams]);

  const toggleCategory = (id: string) => {
    let updated: string[];
    if (selectedCategories.includes(id)) {
      updated = selectedCategories.filter((c) => c !== id);
    } else {
      updated = [...selectedCategories, id];
    }
    setSelectedCategories(updated);

    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    if (updated.length) params.set("category", updated.join(","));
    else params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex-1">
    {/* Bouton dropdown */}
    <button
      type="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className="w-full rounded-xl bg-gray-50 px-3 py-2 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 flex justify-between items-center"
    >
      <span>
        {selectedCategories.length > 0
          ? selectedCategories.join(", ")
          : "Filtrer par catégorie"}
      </span>
      <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
    </button>

    {/* Dropdown */}
    {isOpen && (
      <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg rounded-md z-50">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full px-3 py-2 text-sm border-b focus:outline-none focus:ring focus:ring-blue-300 rounded-t-md"
        />
        <ul className="max-h-48 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center hover:bg-blue-100 ${
                    selectedCategories.includes(cat) ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {cat}
                  {selectedCategories.includes(cat) && <span>✔</span>}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-sm">Aucune catégorie trouvée</li>
          )}
        </ul>
      </div>
    )}
  </div>

  );
}
