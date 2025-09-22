"use client";

import { useState } from "react";
import SidebarContent from "@/app/components/SidebarMenu";
import { links } from "@/lib/links";

export default function SettingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Ici tu peux appeler ton API pour mettre à jour le user
    console.log("Sauvegarder les paramètres:", { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // message disparaît après 3s
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent links={links} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">⚙️ Paramètres</h1>

        <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
          {saved && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 text-sm font-medium">
              ✅ Paramètres sauvegardés avec succès !
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              placeholder="Votre nom"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              placeholder="Votre email"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition font-semibold"
          >
            💾 Sauvegarder
          </button>
        </div>
      </main>
    </div>
  );
}
