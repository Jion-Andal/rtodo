const LOCAL_SHELL_HOSTS = new Set(['localhost', '127.0.0.1'])

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveBasePath(): string {
  const base = import.meta.env.BASE_URL
  if (!base || base === './') return ''
  return base.replace(/\/+$/, '')
}

function isLocalShellOrigin(origin: string): boolean {
  if (origin.startsWith('capacitor://') || origin.startsWith('file://')) {
    return true
  }

  try {
    return LOCAL_SHELL_HOSTS.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

/** Canonical public app URL used for auth emails and group invite links. */
export function getAppBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim()
  if (configured) return normalizeBaseUrl(configured)

  if (typeof window === 'undefined') return ''

  const origin = window.location.origin
  const path = resolveBasePath()

  if (!isLocalShellOrigin(origin)) {
    return normalizeBaseUrl(`${origin}${path}`)
  }

  return normalizeBaseUrl(`${origin}${path}`)
}

/** Redirect target for Supabase auth emails (password reset). */
export function getAuthRedirectUrl(): string {
  const appBase = getAppBaseUrl()
  if (appBase && !isLocalShellOrigin(new URL(appBase).origin)) {
    return appBase
  }

  if (typeof window === 'undefined') return ''

  return normalizeBaseUrl(`${window.location.origin}${window.location.pathname}`)
}

export function buildGroupInviteUrl(inviteCode: string): string {
  const base = getAppBaseUrl()
  const url = new URL(`${base}/`)
  url.searchParams.set('join', inviteCode)
  return url.toString()
}

export function clearAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  let changed = false

  for (const key of ['code', 'token_hash', 'type']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }

  if (url.hash.includes('access_token') || url.hash.includes('error=')) {
    url.hash = ''
    changed = true
  }

  if (!changed) return

  const next = url.pathname + (url.search || '') + url.hash
  window.history.replaceState(null, '', next)
}
