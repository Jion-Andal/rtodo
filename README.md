# RTodo

Shared todo app with checklist, notes, events, and expenses. Supports personal workspaces and collaborative groups via Supabase.

Live site (after setup): **https://jion-andal.github.io/rtodo/**

## Local development

```bash
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
npm run dev
```

## Supabase setup

Run the SQL files in `supabase/` in order (see filenames). Minimum set:

1. `schema.sql`
2. `profile-login-fix.sql`
3. `rtodo-entries.sql`
4. `groups.sql`
5. `groups-fix.sql`
6. `groups-leave-delete.sql`
7. `groups-members.sql`

## Deploy on GitHub Pages

### 1. Repository secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |

### 2. Enable GitHub Pages

1. **Settings → Pages**
2. **Build and deployment → Source:** select **GitHub Actions**
3. Push to `main` — the [Deploy workflow](.github/workflows/deploy.yml) runs automatically

### 3. Supabase Auth URLs

In **Supabase → Authentication → URL configuration**:

- **Site URL:** `https://jion-andal.github.io/rtodo/`
- **Redirect URLs:** add `https://jion-andal.github.io/rtodo/**`

### 4. Manual deploy

Actions → **Deploy to GitHub Pages** → **Run workflow**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Repository

https://github.com/Jion-Andal/rtodo
