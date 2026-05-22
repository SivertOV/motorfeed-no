# MotorFeed.no

Premium norsk motorportal med automatisk innholdsmotor.

## Dette er nytt i denne versjonen

- Flere RSS-kilder
- MC-feed via RideApart
- Norsk bilfeed via E24 Bil
- Elbil-feeds via InsideEVs og Green Car Reports
- Automatisk kategorisering: Bil, Elbil, MC og Teknologi
- Bedre fallback-bilder
- Nyhetskort fylles automatisk på forsiden
- Netlify Function: `netlify/functions/fetch-news.js`

## Publisering

Last opp disse filene til GitHub-repoet ditt og commit:

```text
index.html
netlify.toml
README.md
netlify/functions/fetch-news.js
```

Netlify publiserer automatisk etter commit.
