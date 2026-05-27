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
8. `security-hardening.sql` (production — revokes unsafe `group_members` INSERT, locks entry scope)

## Security notes

- Run `security-hardening.sql` on any database that already ran older migrations.
- Group invites require user confirmation in the app before joining.
- Passwords must be at least 8 characters (client validation; set Supabase Auth minimum to match).
- Supabase **anon** key is public by design; access is enforced with RLS.

## Android APK (Capacitor)

Requires [Android Studio](https://developer.android.com/studio) or Android SDK + JDK 17+.

On first build, create `android/local.properties` (gitignored) pointing at your SDK, for example:

```properties
sdk.dir=C\:/Users/YOUR_USER/AppData/Local/Android/Sdk
```

1. Copy `.env.example` to `.env.local` with your Supabase URL and anon key (baked into the build).
2. Build and sync:

```bash
npm run cap:sync
```

3. **Debug APK** (quick install / testing):

```bash
npm run android:debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Release APK** (production):

```bash
cp android/keystore.properties.example android/keystore.properties
# Create keystore and edit keystore.properties
npm run android:release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

5. In **Supabase → Authentication → URL configuration**, add your app origin if you use custom URL schemes later.

Install the APK on a device (enable “Install unknown apps” for the file manager you use).

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
| `npm run build:app` | Production build for mobile (`VITE_BASE_PATH=./`) |
| `npm run cap:sync` | Build web app and sync to Android |
| `npm run android:debug` | Build debug APK |
| `npm run android:release` | Build release APK |
| `npm run lint` | ESLint |

## Repository

https://github.com/Jion-Andal/rtodo
