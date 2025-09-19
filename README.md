# WorldFeeds

**WorldFeeds** est un projet développé en **Next.js** pour agréger et afficher des articles de plusieurs flux RSS internationaux.

## Technologies utilisées

- **Next.js** : framework React pour le rendu côté serveur et le front-end.
- **PostgreSQL** : base de données pour stocker les articles et les informations associées.
- **Redis** : cache pour accélérer la récupération des flux RSS et réduire les appels réseau.
- **Node-cron** : planification de tâches pour scraper les flux RSS automatiquement à intervalle régulier.
- **rss-parser, node-fetch, cheerio** : parsing et récupération des contenus des flux RSS.
- **Prisma ORM** : interaction avec PostgreSQL.

## Fonctionnalités principales

1. **Scraping RSS** :
   - Récupération automatique des flux RSS définis dans `FEEDS`.
   - Support pour `media:content`, `media:thumbnail` et récupération d'images Open Graph.

2. **Insertion automatique dans PostgreSQL** :
   - Chaque article est enregistré dans la base avec un identifiant unique.
   - Vérification pour éviter les doublons.

3. **Cache Redis** :
   - Mise en cache des articles pour accélérer les requêtes côté client.

4. **Pagination et filtres** :
   - Recherche par mot-clé et par source.
   - Filtrage par catégories.
   - Pagination optimisée avec affichage des pages et séparateurs.

5. **Interface utilisateur** :
   - Liste d'articles avec titre, image, résumé et catégories.
   - Catégories affichées en badges, possibilité d’afficher tous les badges au clic.

6. **Tâches cron** :
   - Planification des scrapes toutes les heures.

## Utilisation

### Installation

```bash
git clone <repo-url>
cd worldfeeds
npm install
```

### Configuration

- Copier `.env.example` en `.env` et remplir les variables :
  - `DATABASE_URL` pour PostgreSQL
  - `REDIS_URL` pour Redis

### Lancer le projet

```bash
npm run dev
```

### Cron pour scraping RSS

Les flux RSS sont scrappés automatiquement toutes les heures via `node-cron`. Le code principal se trouve dans `cron/cronFeeds.ts`.

### Exemple d'utilisation du scraping

```ts
import { scrapeFeeds } from '@/lib/scrapeFeeds';
const articles = await scrapeFeeds('keyword', 'CNN World');
```

## Structure du projet

```
/worldfeeds
├─ /cron
│  └─ cronFeeds.ts      # Tâches cron pour scraping RSS
├─ /lib
│  ├─ scrapeFeeds.ts    # Fonction pour récupérer et parser les flux RSS
│  └─ redis.ts          # Connexion et gestion du cache Redis
├─ /components
│  └─ ArticleList.tsx   # Composant pour afficher les articles
├─ /pages
│  └─ index.tsx         # Page principale
├─ prisma
│  └─ schema.prisma     # Modèle de la base de données
└─ README.md
```

## Licence

MIT