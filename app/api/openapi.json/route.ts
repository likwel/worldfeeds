// app/api/openapi.json/route.ts
import { NextResponse } from "next/server";

const openapi = {
  openapi: "3.0.1",
  info: { title: "WorldFeeds API", version: "1.0.0", description: "API pour articles, favorites, likes, reviews. Auth via API key (Bearer <token>)." },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: "http", scheme: "bearer", bearerFormat: "Token" }
    }
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    "/api/articles": {
      get: {
        summary: "Lister articles",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "source", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "category", in: "query", schema: { type: "string" }, description: "CSV" }
        ],
        responses: { "200": { description: "Liste d'articles" } }
      }
    },
    "/api/auth/apikeys": {
      get: { summary: "Lister les API keys (user authenticated)" },
      post: { summary: "Créer une API key (user authenticated)" }
    },
    "/api/articles/{id}/like": {
      post: { summary: "Like an article" },
      delete: { summary: "Unlike an article" }
    },
    "/api/articles/{id}/view": { post: { summary: "Increment view count" } },
    "/api/favorites": { post: { summary: "Add favorite" } },
    "/api/reviews": { post: { summary: "Add / update review" } }
  }
};

export async function GET() {
  return NextResponse.json(openapi);
}
