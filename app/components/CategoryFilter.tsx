// CategoryFilter.tsx
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🌐 Categories</h2>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategories.includes(cat.id)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
