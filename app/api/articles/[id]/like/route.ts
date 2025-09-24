import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extraire les données du corps de la requête (userId et isLiked)
    // const { userId } = await request.json(); // On suppose que userId est passé dans la requête
    const userId = 1;

    // 2. Vérifier si un like existe déjà pour cet article et cet utilisateur
    const existingLike = await prisma.like.findUnique({
      where: {
          articleId: params.id,
          userId: userId,  // ID de l'utilisateur qui aime l'article
        },
    });

    // 3. Si le like existe, le supprimer. Sinon, l'ajouter.
    if (existingLike) {
      // Si un like existe déjà, on le supprime
      await prisma.like.delete({
        where: {
            articleId: params.id,
            userId: userId,
          },
      });
      return NextResponse.json({
        message: "Like supprimé",
      });
    } else {
      // Si le like n'existe pas, on l'ajoute
      await prisma.like.create({
        data: {
          articleId: params.id,
          userId: userId,
        },
      });
      return NextResponse.json({
        message: "Like ajouté",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la gestion des likes :", error);
    return NextResponse.json(
      { error: "Impossible de gérer le like" },
      { status: 500 }
    );
  }
}
