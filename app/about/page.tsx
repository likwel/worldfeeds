"use client";

import SidebarContent from "@/app/components/SidebarMenu";
import { links } from "@/lib/links";
import { InformationCircleIcon, UserGroupIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function AboutPage() {
  const features = [
    {
      icon: <InformationCircleIcon className="h-6 w-6 text-indigo-600" />,
      title: "Centralisation des flux",
      description: "WorldFeeds regroupe des actualités de multiples sources internationales pour un accès rapide."
    },
    {
      icon: <UserGroupIcon className="h-6 w-6 text-indigo-600" />,
      title: "Gestion des utilisateurs",
      description: "Créez un compte, gérez vos clés API, vos favoris et vos avis sur les articles."
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />,
      title: "Sécurité et personnalisation",
      description: "Vos données sont sécurisées, et vous pouvez personnaliser votre flux selon vos préférences."
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent links={links} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">🌐 À propos de WorldFeeds</h1>

        <p className="text-gray-700 mb-6">
          WorldFeeds est une application qui centralise les flux d’actualités de plusieurs sources internationales,
          permettant aux utilisateurs de lire, sauvegarder et commenter des articles.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                {f.icon}
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-indigo-50 p-6 rounded-2xl shadow-inner">
          <p className="text-gray-700">
            Notre objectif est de fournir un flux d’actualités personnalisé et sécurisé, accessible
            directement depuis votre navigateur, avec une expérience agréable et intuitive.
          </p>
        </div>
      </main>
    </div>
  );
}
