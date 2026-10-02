# CI/CD

## Current State

No CI/CD pipeline exists. No `.github/workflows/` directory is present.

## Recommended Pipeline (GitHub Actions)

### `ci.yml` — runs on every push and PR

```yaml
# Suggested steps (not yet implemented):
# 1. Install dependencies
# 2. Run lint (npm run lint)
# 3. Run type-check (tsc --noEmit)
# 4. Run tests (npm test)
# 5. Build (npm run build) — ensures no build-time errors
```

### `deploy.yml` — runs on merge to main

```yaml
# Suggested steps:
# 1. Run CI checks
# 2. Run prisma migrate deploy (against production DB)
# 3. Deploy to hosting provider (Vercel recommended)
```

## Environment Variables in CI

- Store all secrets in GitHub Actions repository secrets
- Never echo or print env values in workflow logs

## Database Migrations in CD

```bash
# Production-safe: applies pending migrations, no shadow DB required
npx prisma migrate deploy
```

Run this as a pre-deploy step before the application starts. On Vercel this can be a build command or a dedicated migration script.

## Branch Strategy (recommendation)

| Branch    | Purpose                                      |
| --------- | -------------------------------------------- |
| `main`    | Production-ready code; deploys automatically |
| `develop` | Integration branch (optional)                |
| `feat/*`  | Feature branches                             |
| `fix/*`   | Bug fix branches                             |

## Checklist Before First CI Setup

- [ ] Add `.env.example` to repo (placeholder values only)
- [ ] Confirm test runner (Vitest recommended)
- [ ] Set GitHub secrets: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Decide hosting provider (Vercel, Railway, Fly.io?)
- [ ] Add `prisma migrate deploy` as pre-deploy step
- [ ] Set up Neon branching for preview deployments (Neon supports branch-per-PR)
