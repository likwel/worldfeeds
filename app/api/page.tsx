"use client";

import { useEffect, useState } from "react";
import SidebarContent from "@/app/components/SidebarMenu";
import { links } from "@/lib/links";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  async function fetchKeys() {
    const res = await fetch("/api/auth/apikeys", {
      headers: { Authorization: `Bearer ${localStorage.getItem("API_TOKEN")}` },
    });
    if (res.ok) setKeys(await res.json());
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    const res = await fetch("/api/auth/apikeys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("API_TOKEN")}`,
      },
      body: JSON.stringify({ name: newKeyName }),
    });

    if (res.ok) {
      const data = await res.json();
      setJustCreatedKey(data.apiKey);
      setNewKeyName("");
      fetchKeys();
    }
  }

  async function revokeKey(id: number) {
    await fetch("/api/auth/apikeys", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("API_TOKEN")}`,
      },
      body: JSON.stringify({ id }),
    });
    fetchKeys();
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent links={links} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-800">🔑 Gestion des API Keys</h1>

          {justCreatedKey && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <p className="font-mono text-sm">
                ✅ Clé générée : <span className="font-bold">{justCreatedKey}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Copiez-la maintenant, elle ne sera plus visible.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nom de la clé (ex: script de prod)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <button
              onClick={createKey}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Créer
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg divide-y bg-white shadow-sm">
            {keys.length === 0 && (
              <p className="p-4 text-gray-500 text-sm text-center">
                Aucune clé API pour le moment.
              </p>
            )}
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 transition"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-800">{k.name || "Sans nom"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID : {k.id} | Last4 : {k.last4} |{" "}
                    {k.revoked ? (
                      <span className="text-red-600 font-semibold">Révoquée 🚫</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Active ✅</span>
                    )}
                  </p>
                </div>
                {!k.revoked && (
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="text-red-600 text-sm hover:underline mt-2 sm:mt-0"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
