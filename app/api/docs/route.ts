// app/api/docs/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    const html = `<!doctype html>
    <html>
        <head>
            <meta charset="utf-8" />
            <title>API Docs - WorldFeeds</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
        </head>
        <body>
            <div id="swagger"></div>
            <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
            <script>
            window.onload = function() {
                SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger',
                deepLinking: true,
                });
            };
            </script>
        </body>
    </html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
