# Career Intelligence Dashboard

A local Next.js app for tracking career opportunities, ratings, applications, interviews, scores, and daily JSON imports.

## Run locally

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## New interactive workflow

- Use **Good**, **Dream**, or **Bad** to train what is/isn't interesting.
- Use **Mark Applied**, **Interview**, and **Archive** to move opportunities through the pipeline.
- Use **Edit** for detailed status, rating, applied date, follow-up date, notes, resume version, and cover letter fields.
- Use **Backup JSON** at the end of the day to preserve your work.
- Use **Restore / Import** to import either a daily JSON brief or a full backup JSON.

## Data storage

The app stores data in browser localStorage. Back up regularly using **Backup JSON**.

## Daily import format

Paste an array of opportunities or `{ "opportunities": [...] }`. Existing records with the same organization + position are updated instead of duplicated.
