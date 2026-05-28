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

Mobile app icons and splash screens are generated from `assets/icon.svg` (the RTodo logo). After updating the logo, run:

```bash
npm run assets:generate
npm run cap:sync
```

5. In **Supabase → Authentication → URL configuration**, add your app origin if you use custom URL schemes later.

Install the APK on a device (enable “Install unknown apps” for the file manager you use).

## iOS release (Capacitor)

Requires **macOS**, **Xcode**, and an [Apple Developer](https://developer.apple.com) account to install on physical devices.

1. Copy `.env.example` to `.env.local` with your Supabase URL and anon key (baked into the build).
2. Sync the web app into the native project:

```bash
npm run cap:sync
```

3. **Release IPA** (Mac terminal):

```bash
npm run ios:release
```

Output: `ios/App/build/export/App.ipa` (exact filename may vary)

4. **Xcode alternative:** open the project, select your team under Signing & Capabilities, then **Product → Archive → Distribute App**.

```bash
npm run cap:ios
```

5. **GitHub Actions (Mac runner):** Actions → **iOS Release** → **Run workflow**.  
   For a signed IPA artifact, add these repository secrets:

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |
| `VITE_APP_URL` | Optional override; defaults to `https://jion-andal.github.io/rtodo` in `.env.production` |
| `IOS_P12_BASE64` | Base64-encoded `.p12` distribution certificate |
| `IOS_P12_PASSWORD` | Certificate password |
| `IOS_KEYCHAIN_PASSWORD` | Temporary keychain password for CI |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded provisioning profile |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

Without signing secrets, the workflow still produces an unsigned `.xcarchive` for verification only (not installable on devices).

## Deploy on GitHub Pages

### 1. Repository secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |
| `VITE_APP_URL` | Optional override; defaults to `https://jion-andal.github.io/rtodo` in `.env.production` |

### 2. Enable GitHub Pages

1. **Settings → Pages**
2. **Build and deployment → Source:** select **GitHub Actions**
3. Push to `main` — the [Deploy workflow](.github/workflows/deploy.yml) runs automatically

### 3. Supabase Auth URLs

In **Supabase → Authentication → URL configuration**:

- **Site URL:** `https://jion-andal.github.io/rtodo/`
- **Redirect URLs:** add these (remove any `http://localhost` entries for production):
  - `https://jion-andal.github.io/rtodo`
  - `https://jion-andal.github.io/rtodo/**`

In **Supabase → Authentication → Providers → Email**, turn off **Confirm email** so new accounts can sign in immediately after signup.

Password reset and group invite links use `VITE_APP_URL` (see `.env.production`). Mobile builds must include this value so links do not point at Capacitor’s `localhost` shell.

### 4. Manual deploy

Actions → **Deploy to GitHub Pages** → **Run workflow**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run build:app` | Production build for mobile (`VITE_BASE_PATH=./`) |
| `npm run cap:sync` | Build web app and sync to Android/iOS |
| `npm run assets:generate` | Regenerate mobile app icons and splash screens |
| `npm run cap:ios` | Open iOS project in Xcode (Mac) |
| `npm run android:debug` | Build debug APK |
| `npm run android:release` | Build release APK |
| `npm run ios:release` | Build release IPA on Mac |
| `npm run lint` | ESLint |

## Repository

https://github.com/Jion-Andal/rtodo
