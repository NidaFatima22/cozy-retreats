# Cozy Retreats
Run: `npm install && npm start` → http://localhost:3000 · Admin: /admin.html (password = ADMIN_PASSWORD in .env, default `admin123` — change it!)
Edit prices/availability from the admin page. New reviews appear immediately; admins can unpublish or delete them. Data is stored in `data/db.json`.

Production storage: connect Neon in Vercel with DATABASE_URL. The first API request creates cozy_site_data and seeds it from data/db.json once. Subsequent reviews and admin edits persist in PostgreSQL and are never overwritten by redeployments. Concurrent updates use a transaction and row lock. Without DATABASE_URL, local development uses the JSON file; Vercel fails safely rather than attempting file writes. Reviews publish immediately, including legacy submissions awaiting approval. Admins can explicitly unpublish or delete reviews.
