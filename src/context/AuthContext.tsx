import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { clearAuthParamsFromUrl, getAuthRedirectUrl } from '../lib/appUrl'
import { MIN_PASSWORD_LENGTH } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export interface SignUpInput {
  email: string
  username: string
  password: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  username: string | null
  loading: boolean
  recoveryMode: boolean
  signIn: (username: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  requestPasswordReset: (username: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateUsername: (newUsername: string) => Promise<void>
  deleteAccount: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_INIT_TIMEOUT_MS = 8000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    }),
  ])
}

interface ProfileRow {
  username: string
  display_name: string
}

function readProfileFromMetadata(user: User | undefined): ProfileRow | null {
  if (!user) return null

  const username = typeof user.user_metadata?.username === 'string'
    ? user.user_metadata.username.trim()
    : ''

  if (!username) return null

  return {
    username,
    display_name: username,
  }
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data
}

async function ensureProfileForUser(user: User): Promise<ProfileRow | null> {
  if (!supabase) return null

  const existing = await fetchProfile(user.id)
  if (existing) return existing

  const fromMetadata = readProfileFromMetadata(user)
  if (!fromMetadata) return null

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username: fromMetadata.username,
        display_name: fromMetadata.display_name,
      },
      { onConflict: 'id' },
    )
    .select('username, display_name')
    .maybeSingle()

  if (error) {
    console.error('Could not create profile:', error)
    return fromMetadata
  }

  return data ?? fromMetadata
}

async function resolveEmailForUsername(username: string): Promise<string | null> {
  if (!supabase) return null
  const { data: email, error } = await supabase.rpc('get_email_for_username', {
    p_username: username,
  })
  if (error) {
    console.error('Username lookup failed:', error)
    return null
  }
  if (typeof email !== 'string' || !email) return null
  return email
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Email is already registered.'
  }
  if (lower.includes('duplicate key') || lower.includes('profiles_username_lower_idx')) {
    return 'Username is already taken.'
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid username or password.'
  }
  if (lower.includes('password')) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return message
}

function mapSignInError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid username or password.'
  }
  return mapAuthError(message)
}

function isRecoveryAuthEvent(event: AuthChangeEvent): boolean {
  return event === 'PASSWORD_RECOVERY'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [recoveryMode, setRecoveryMode] = useState(false)

  const loadProfile = useCallback(async (user: User | undefined) => {
    if (!user) {
      setUsername(null)
      return
    }

    const profile = await ensureProfileForUser(user)
    setUsername(profile?.username ?? null)
  }, [])

  const handleAuthChange = useCallback(
    (event: AuthChangeEvent, next: Session | null) => {
      setSession(next)
      setLoading(false)

      if (isRecoveryAuthEvent(event)) {
        setRecoveryMode(true)
      } else if (event === 'SIGNED_OUT') {
        setRecoveryMode(false)
      }

      if (
        next &&
        (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY')
      ) {
        clearAuthParamsFromUrl()
      }

      void loadProfile(next?.user)
    },
    [loadProfile],
  )

  useEffect(() => {
    const client = supabase
    if (!client) {
      setLoading(false)
      return
    }

    void (async () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Auth callback failed:', error)
          } else {
            clearAuthParamsFromUrl()
          }
        }
      }
    })()

    withTimeout(client.auth.getSession(), AUTH_INIT_TIMEOUT_MS, 'Auth session check')
      .then(({ data }) => {
        setSession(data.session)
        void loadProfile(data.session?.user)
      })
      .catch((err) => {
        console.error('Auth session check failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    client.auth.startAutoRefresh()

    const { data: subscription } = client.auth.onAuthStateChange(handleAuthChange)

    return () => {
      subscription.subscription.unsubscribe()
      client.auth.stopAutoRefresh()
    }
  }, [handleAuthChange, loadProfile])

  const signIn = useCallback(async (usernameInput: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.')

    const trimmed = usernameInput.trim()
    if (!trimmed) throw new Error('Username is required.')

    const email = await resolveEmailForUsername(trimmed)
    if (!email) throw new Error('Invalid username or password.')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(mapSignInError(error.message))
  }, [])

  const signUp = useCallback(async (input: SignUpInput): Promise<void> => {
    if (!supabase) throw new Error('Supabase is not configured.')

    const email = input.email.trim()
    const usernameValue = input.username.trim()
    const password = input.password

    if (!email || !usernameValue) {
      throw new Error('All fields are required.')
    }
    if (usernameValue.length < 3) {
      throw new Error('Username must be at least 3 characters.')
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: usernameValue,
        },
      },
    })

    if (error) throw new Error(mapAuthError(error.message))
    if (!data.user) throw new Error('Sign up failed. Please try again.')
    if (!data.session) {
      throw new Error('Sign up failed. Please try again or contact support.')
    }

    setSession(data.session)
    await loadProfile(data.user)
  }, [loadProfile])

  const requestPasswordReset = useCallback(async (usernameInput: string) => {
    if (!supabase) throw new Error('Supabase is not configured.')

    const trimmed = usernameInput.trim()
    if (!trimmed) throw new Error('Username is required.')

    const email = await resolveEmailForUsername(trimmed)
    if (!email) return

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    })
    if (error) throw new Error('Could not send reset email. Please try again.')
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.')
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(mapAuthError(error.message))

    setRecoveryMode(false)
    clearAuthParamsFromUrl()
  }, [])

  const updateUsername = useCallback(async (newUsername: string) => {
    if (!supabase) throw new Error('Supabase is not configured.')

    const user = session?.user
    if (!user) throw new Error('Not signed in.')

    const trimmed = newUsername.trim()
    if (!trimmed) throw new Error('Username is required.')
    if (trimmed.length < 3) throw new Error('Username must be at least 3 characters.')

    if (trimmed.toLowerCase() === username?.toLowerCase()) {
      return
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmed)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      throw new Error('Username is already taken.')
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: trimmed, display_name: trimmed })
      .eq('id', user.id)

    if (profileError) throw new Error(mapAuthError(profileError.message))

    const { error: authError } = await supabase.auth.updateUser({
      data: { username: trimmed },
    })
    if (authError) throw new Error(mapAuthError(authError.message))

    setUsername(trimmed)
  }, [session, username])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUsername(null)
    setRecoveryMode(false)
  }, [])

  const deleteAccount = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.')

    const { error } = await supabase.rpc('delete_my_account')
    if (error) throw new Error(mapAuthError(error.message))

    await signOut()
  }, [signOut])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      username,
      loading,
      recoveryMode,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      updateUsername,
      deleteAccount,
      signOut,
    }),
    [
      session,
      username,
      loading,
      recoveryMode,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      updateUsername,
      deleteAccount,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
