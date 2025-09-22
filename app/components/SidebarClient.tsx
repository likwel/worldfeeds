"use client";
import { useState, useEffect } from "react";
import { SidebarContentFilter } from "./CategoryFilter";

export default function SidebarClient() {
  const [categories, setCategories] = useState<{id:string,name:string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="w-full rounded-xl bg-gray-50 px-3 py-2 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 flex justify-between items-center">Chargement...</div>;

  return <SidebarContentFilter categories={categories} />;
}
