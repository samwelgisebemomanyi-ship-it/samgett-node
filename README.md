# Samgett Node Starter

Quick start (local with Docker)

1. Copy `.env.sample` to `.env` and edit values.
2. Run `migrations.sql` against your MySQL (or let the app connect and run manually).
3. Start with Docker Compose:

```bash
docker compose up --build
```

App will be at `http://localhost:4000`.

## What I added for you in this package
- Expanded webhook to create and mark orders as paid (Stripe)
- MPesa STK push endpoints (sandbox flow) and callback route
- Admin React skeleton files (Login, Products, API helper)
- .gitignore and GitHub Actions CI workflow

## Next steps
- Replace Stripe and MPesa secrets in `.env`
- Secure webhooks and validate MPesa callbacks
- Add input validation and rate limiting
- Deploy: use Docker on Render/DO or push frontend to Vercel
