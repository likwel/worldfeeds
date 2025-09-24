"use client";
import { useState } from "react";
import { Home, Image, FileText, Info, Code, Menu, X, Video, Settings, Bell, User } from "lucide-react";
import { Eye, Heart, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import { nanoid } from "nanoid";
import SidebarContent from "./SidebarMenu";
import SidebarClient from "./SidebarClient";
import { prisma } from "@/lib/db"; // ton client Prisma
import { links } from "@/lib/links";

function ArticleCard({ a, handleReview }: { a: any; handleReview: any }) {

  const [views, setViews] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    // e.preventDefault(); // Empêche d'ouvrir le lien parent si c'est dans <a>
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${a.id}/view`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();

      setViews(data.viewCount); // ✅ met à jour avec la valeur renvoyée par le backend
    } catch (error) {
      console.error("Impossible de mettre à jour les vues :", error);
    } finally {
      setLoading(false);
    }
  }


  return (

    <a
      onClick={handleClick}
      href={a.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="relative">
        <img
          src={
            a.enclosureUrl
              ? a.enclosureUrl
              : a.thumbnail
                ? a.thumbnail
                : a.imageUrl
                  ? a.imageUrl
                  : `https://picsum.photos/seed/${encodeURIComponent(
                    a.title
                  )}/400/300`
          }
          alt={a.title || `Preview de l'article`}
          className="h-48 w-full object-cover"
        />

        {/* 🏷️ Source en haut à gauche */}
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          {a.source}
        </span>

        {/* 🏷️ Badges catégories en haut à droite */}
        {a.categories && a.categories.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1">
            {(typeof a.categories === "string"
              ? a.categories.split(",")
              : a.categories
            )
              .slice(0, 1)
              .map((cat: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow"
                >
                  {cat.trim()}
                </span>
              ))}

            {(typeof a.categories === "string"
              ? a.categories.split(",")
              : a.categories
            ).length > 1 && (
                <span
                  className="bg-gray-300 text-gray-800 text-xs font-medium px-2 py-1 rounded-full shadow cursor-help"
                  title={(typeof a.categories === "string"
                    ? a.categories.split(",")
                    : a.categories
                  )
                    .slice(1)
                    .join(", ")}
                >
                  +
                  {(typeof a.categories === "string"
                    ? a.categories.split(",")
                    : a.categories
                  ).length - 1}
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
          <span className="inline-block bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-md font-medium">
            {a.creator ? a.creator : a.source}
          </span>
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

        {/* 🔽 Nouveau bloc : vues + note + j'aime */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          {/* 👁️ Nombre de vues */}

          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600" >
            <Eye className="h-4 w-4" />
            <span>{a.viewCount ?? 0}</span>
          </div>

          {/* ⭐ Note moyenne */}
          <div className="flex items-center gap-1" onClick={(e) => handleReview(a, e)}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(a._count.reviews ?? 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
                  }`}
              />
            ))}
          </div>

          {/* ❤️ J'aime */}
          <LikeButton articleId={a.id} initialLikes={a._count.likes ?? 0} />
        </div>
      </div>
    </a>

  )
}

function LikeButton({ articleId, initialLikes }: { articleId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false); // Suivi de l'état du like (ajouté ou non)

  // Fonction pour basculer le like
  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault(); // Empêche l'ouverture du lien parent s'il est dans <a>
    if (liked) {
      // Si l'utilisateur a déjà liké, on le supprime
      setLiked(false);
      setLikes(likes - 1); // Réduit le compteur de like localement
    } else {
      // Si l'utilisateur n'a pas encore liké, on ajoute le like
      setLiked(true);
      setLikes(likes + 1); // Augmente le compteur de like localement
    }

    try {
      // Envoie de la requête POST à l'API pour ajouter ou supprimer le like
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId: 1 }), // Remplacer 1 par l'ID de l'utilisateur authentifié
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();
      // Si l'API retourne un message, on peut l'utiliser pour effectuer des actions supplémentaires.
      console.log(data.message); // Par exemple : "Like ajouté" ou "Like supprimé"
    } catch (error) {
      console.error("Impossible de mettre à jour le like :", error);
      // Si une erreur survient, on réinitialise l'état local
      setLiked(!liked);
      setLikes(likes); // Remettre le compteur de like à sa valeur précédente
    }
  }

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1 hover:text-red-600 transition"
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-red-600 text-red-600" : ""}`}
      />
      <span>{likes}</span>
    </button>
  );
}

export default function ArticlesList({ items, total, q, source, page }: any) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // État du modal
  const [currentArticle, setCurrentArticle] = useState<any>(null); // Article sélectionné
  const [reviews, setReviews] = useState<any[]>([]); // Liste des avis
  const [rating, setRating] = useState(0); // Note pour le formulaire
  const [comment, setComment] = useState(""); // Commentaire pour le formulaire
  const [loading, setLoading] = useState(false);

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  async function handleReview(a: any, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentArticle(a);
    setIsModalOpen(true); // Ouvre le modal
    try {

      const res = await fetch(`/api/articles/${a.id}/reviews`);
      // Vérifie si la réponse est OK (statut 200)
      if (!res.ok) {
        // Si la réponse n'est pas OK, on lance une erreur
        throw new Error(`Erreur lors de la récupération des avis: ${res.statusText}`);
      }

      const data = await res.json();
      setReviews(data.reviews); // Mettre à jour les avis
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error);
    }
  }

  // Fonction pour soumettre un nouvel avis
  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // const res = await fetch(`/api/articles/${currentArticle.id}/reviews`, {
      //   method: "POST",
      //   body: JSON.stringify({ rating, comment }),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // if (!res.ok) throw new Error("Erreur API");

      // const data = await res.json();

      const data = {
          "newReview": {
            "id": 1,
            "userId": 1,
            "articleId": "abc123",
            "rating": 4,
            "comment": "Très bon article !",
            "createdAt": "2023-10-20T12:34:56.789Z"
          }
        }

      setReviews([data.newReview, ...reviews]); // Ajouter le nouvel avis en haut
      setRating(0); // Réinitialiser la note
      setComment(""); // Réinitialiser le commentaire
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour fermer le modal
  function closeModal() {
    setIsModalOpen(false); // Ferme le modal
  }

  // Fonction pour gérer la sélection de la note
  function handleRatingClick(i: number) {
    setRating(i + 1); // Met à jour la note (1-5)
  }

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


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent links={links} />

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

              {/* Dropdown catégories */}
              <div className="w-60">
                <SidebarClient />
              </div>

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
                  className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${isActive
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
                  <ArticleCard a={a} handleReview={handleReview} />
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
                className={`px-4 py-2 rounded-lg text-sm font-medium ${page === 1
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${p === page
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
                className={`px-4 py-2 rounded-lg text-sm font-medium ${page === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Suivant ➡
              </a>
            </div>
          )}

          {/* Modal pour les avis */}
          {isModalOpen && currentArticle && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold mb-4">Avis sur l'article</h2>

                {/* Affichage des avis */}
                <div className="mb-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p>Aucun avis disponible pour cet article.</p>
                  )}
                </div>

                {/* Formulaire pour ajouter un avis */}
                <form onSubmit={submitReview}>
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                      Note (1 à 5)
                    </label>
                    
                    <input
                      type="number"
                      id="rating"
                      name="rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      min="1"
                      max="5"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Commentaire
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Soumettre
                  </button>
                </form>

                {/* Bouton pour fermer le modal */}
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Modal pour les avis */}
          {isModalOpen && currentArticle && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                  <h2 className="text-2xl font-semibold mb-4 text-center">Avis sur l'article</h2>

                  {/* Affichage des avis */}
                  <div className="mb-4 max-h-60 overflow-auto">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Aucun avis disponible pour cet article.</p>
                    )}
                  </div>

                  {/* Formulaire pour ajouter un avis */}
                  <form onSubmit={submitReview}>
                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Notez cet article (1 à 5)
                      </label>
                      <div className="flex justify-center gap-2">
                        {/* ⭐ Choix de la note */}
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-8 w-8 cursor-pointer ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            onClick={() => handleRatingClick(i)} // Permet de sélectionner la note
                          />
                        ))}
                      </div>
                    </div>

                    {/* Champ caché pour la note */}
                    <input
                      type="hidden"
                      id="rating"
                      name="rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      min="1"
                      max="5"
                      required
                    />

                    {/* Commentaire */}
                    <div className="mt-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Votre commentaire</label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="4"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Votre avis ici..."
                      />
                    </div>

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Soumettre l'avis
                    </button>
                  </form>

                  {/* Bouton pour fermer le modal */}
                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}


        </div>
      </main>
    </div>
  );
}