# Scores partages

Le jeu utilise une API `/api/scores` servie par Cloudflare Workers et une base Cloudflare D1.

## Identifiants de bornes

- `siteId` identifie le lieu ou point public.
- `deviceId` identifie automatiquement le navigateur de l'ordinateur.
- L'adresse IP n'est pas utilisee comme identifiant principal, car elle peut changer, etre partagee ou dependre du reseau du lieu.

Pour fixer le lieu d'une borne, ouvrir le jeu une premiere fois avec un parametre d'URL :

```text
https://votre-jeu.example/?site=maison-proximites-centre
```

La valeur est ensuite conservee dans le navigateur de cette borne. Le parametre `?point=` fonctionne aussi.

## Mode hors ligne

Si une borne perd l'acces reseau au moment de l'enregistrement, le score est garde localement dans une file d'attente. Au prochain chargement avec connexion, le jeu tente de synchroniser les scores en attente.

## Mise en place D1

1. Creer la base :

```bash
npm run db:create
```

2. Copier le `database_id` donne par Wrangler dans `wrangler.toml`.

3. Appliquer le schema en production :

```bash
npm run db:init:remote
```

4. Lancer en local :

```bash
npm run dev
```

5. Deployer :

```bash
npm run deploy
```

## Endpoints

- `GET /api/scores?limit=10` retourne le top global.
- `GET /api/scores?scope=site&site=maison-proximites-centre` retourne le top d'un lieu.
- `POST /api/scores` enregistre un score.

Le score est recalcule cote serveur a partir du niveau, du temps, des coups et des indices.
