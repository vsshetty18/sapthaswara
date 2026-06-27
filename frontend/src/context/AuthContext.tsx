/* ============================================================
   SVARAVERSE AI — Authentication Context
   Manages auth state, user profile, roles, and onboarding
   ============================================================ */

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  firebaseSignOut,
  onAuthChange,
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  isUsernameTaken,
  requestNotificationPermission,
  subscribeToNotifications,
  getIdToken,
  auth,
} from '@/services/firebase'

import {
  type User,
  type AuthUser,
  type LoginCredentials,
  type SignupCredentials,
  type Notification,
  UserRole,
  SubscriptionPlan,
} from '@/types'

import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'

// ─── CONTEXT TYPES ──────────────────────────────────────────────────────────

interface AuthContextValue {
  // State
  user:              User | null
  firebaseUser:      AuthUser | null
  isLoading:         boolean
  isAuthenticated:   boolean
  isEmailVerified:   boolean
  notifications:     Notification[]
  unreadCount:       number

  // Role helpers
  isUser:            boolean
  isCreator:         boolean
  isPremium:         boolean
  isAdmin:           boolean
  isOwner:           boolean
  hasRole:           (role: UserRole) => boolean
  hasPlan:           (plan: SubscriptionPlan) => boolean

  // Auth actions
  loginWithGoogle:   () => Promise<void>
  loginWithEmail:    (credentials: LoginCredentials) => Promise<void>
  register:          (credentials: SignupCredentials) => Promise<void>
  logout:            () => Promise<void>
  forgotPassword:    (email: string) => Promise<void>

  // Profile actions
  refreshUser:       () => Promise<void>
  updateProfile:     (data: Partial<User>) => Promise<void>

  // Token
  getToken:          () => Promise<string | null>
}

// ─── CONTEXT ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── DEFAULT USER SHAPE ─────────────────────────────────────────────────────

const buildDefaultUser = (
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
): Partial<User> => ({
  uid,
  email,
  displayName,
  username:           generateUsername(displayName),
  photoURL:           photoURL || undefined,
  role:               UserRole.USER,
  plan:               SubscriptionPlan.FREE,
  isEmailVerified:    false,
  isActive:           true,
  country:            'India',
  totalSongs:         0,
  totalPracticeHours: 0,
  currentStreak:      0,
  longestStreak:      0,
  totalUploads:       0,
  createdAt:          new Date().toISOString(),
  updatedAt:          new Date().toISOString(),
})

// ─── HELPERS ────────────────────────────────────────────────────────────────

function generateUsername(displayName: string): string {
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15)
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `${base}${suffix}`
}

function mapDocToUser(doc: Record<string, unknown>): User {
  return {
    id:                 (doc.id              as string)  || (doc.uid as string) || '',
    uid:                (doc.uid             as string)  || '',
    email:              (doc.email           as string)  || '',
    username:           (doc.username        as string)  || '',
    displayName:        (doc.displayName     as string)  || '',
    photoURL:           (doc.photoURL        as string)  || undefined,
    bio:                (doc.bio             as string)  || undefined,
    role:               (doc.role            as UserRole) || UserRole.USER,
    plan:               (doc.plan            as SubscriptionPlan) || SubscriptionPlan.FREE,
    isEmailVerified:    (doc.isEmailVerified as boolean) || false,
    isActive:           (doc.isActive        as boolean) ?? true,
    country:            (doc.country         as string)  || 'India',
    phone:              (doc.phone           as string)  || undefined,
    city:               (doc.city            as string)  || undefined,
    state:              (doc.state           as string)  || undefined,
    instagramHandle:    (doc.instagramHandle as string)  || undefined,
    youtubeChannelId:   (doc.youtubeChannelId as string) || undefined,
    youtubeChannelUrl:  (doc.youtubeChannelUrl as string)|| undefined,
    primaryScale:       (doc.primaryScale    as string)  || undefined,
    genres:             (doc.genres          as string[])|| [],
    instruments:        (doc.instruments     as string[])|| [],
    yearsOfExperience:  (doc.yearsOfExperience as number)|| undefined,
    totalSongs:         (doc.totalSongs      as number)  || 0,
    totalPracticeHours: (doc.totalPracticeHours as number) || 0,
    currentStreak:      (doc.currentStreak   as number)  || 0,
    longestStreak:      (doc.longestStreak   as number)  || 0,
    totalUploads:       (doc.totalUploads    as number)  || 0,
    createdAt:          (doc.createdAt       as string)  || new Date().toISOString(),
    updatedAt:          (doc.updatedAt       as string)  || new Date().toISOString(),
    lastLoginAt:        (doc.lastLoginAt     as string)  || undefined,
  }
}

// ─── PROVIDER ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // ── State ────────────────────────────────────────────────
  const [user,         setUser]         = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<AuthUser | null>(null)
  const [isLoading,    setIsLoading]    = useState(true)
  const [notifications,setNotifications]= useState<Notification[]>([])

  // Refs for cleanup
  const notifUnsubRef = useRef<(() => void) | null>(null)

  // ── Derived state ────────────────────────────────────────
  const isAuthenticated = !!user && !!firebaseUser
  const isEmailVerified = firebaseUser?.emailVerified ?? false
  const unreadCount     = notifications.filter(n => !n.isRead).length

  // Role helpers
  const isUser    = user?.role === UserRole.USER
  const isCreator = user?.role === UserRole.CREATOR
  const isPremium = user?.role === UserRole.PREMIUM || user?.plan === SubscriptionPlan.PREMIUM
  const isAdmin   = user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER
  const isOwner   = user?.role === UserRole.OWNER

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false
    const hierarchy: UserRole[] = [
      UserRole.USER,
      UserRole.CREATOR,
      UserRole.PREMIUM,
      UserRole.ADMIN,
      UserRole.OWNER,
    ]
    const userLevel   = hierarchy.indexOf(user.role)
    const targetLevel = hierarchy.indexOf(role)
    return userLevel >= targetLevel
  }, [user])

  const hasPlan = useCallback((plan: SubscriptionPlan): boolean => {
    if (!user) return false
    const planHierarchy: SubscriptionPlan[] = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.BASIC,
      SubscriptionPlan.PRO,
      SubscriptionPlan.PREMIUM,
    ]
    const userLevel   = planHierarchy.indexOf(user.plan)
    const targetLevel = planHierarchy.indexOf(plan)
    return userLevel >= targetLevel
  }, [user])

  // ── Load user from Firestore ─────────────────────────────
  const loadUser = useCallback(async (uid: string): Promise<void> => {
    try {
      const doc = await getUserDocument(uid)
      if (doc) {
        setUser(mapDocToUser(doc as Record<string, unknown>))
      }
    } catch (err) {
      console.error('Failed to load user document:', err)
    }
  }, [])

  // ── Refresh user (re-fetch from Firestore) ───────────────
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!auth.currentUser) return
    await loadUser(auth.currentUser.uid)
  }, [loadUser])

  // ── Subscribe to notifications ───────────────────────────
  const startNotificationListener = useCallback((uid: string) => {
    // Cleanup previous listener
    notifUnsubRef.current?.()

    const unsub = subscribeToNotifications(uid, (docs) => {
      setNotifications(docs as Notification[])
    })
    notifUnsubRef.current = unsub
  }, [])

  // ── Firebase auth state listener ─────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        // Map Firebase user to AuthUser
        const authUser: AuthUser = {
          uid:           fbUser.uid,
          email:         fbUser.email,
          displayName:   fbUser.displayName,
          photoURL:      fbUser.photoURL,
          emailVerified: fbUser.emailVerified,
        }
        setFirebaseUser(authUser)

        // Load full user profile
        await loadUser(fbUser.uid)

        // Update last login + email verification status
        await updateUserDocument(fbUser.uid, {
          lastLoginAt:     new Date().toISOString(),
          isEmailVerified: fbUser.emailVerified,
        })

        // Start notification listener
        startNotificationListener(fbUser.uid)

        // Request FCM permission (non-blocking)
        requestNotificationPermission().then(token => {
          if (token) {
            updateUserDocument(fbUser.uid, { fcmToken: token })
          }
        })
      } else {
        // Signed out
        setFirebaseUser(null)
        setUser(null)
        setNotifications([])
        notifUnsubRef.current?.()
        notifUnsubRef.current = null
      }

      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      notifUnsubRef.current?.()
    }
  }, [loadUser, startNotificationListener])

  // ── AUTH ACTIONS ─────────────────────────────────────────

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      const result = await signInWithGoogle()
      const fbUser = result.user

      // Create or update user document
      const defaultData = buildDefaultUser(
        fbUser.uid,
        fbUser.email || '',
        fbUser.displayName || 'Creator',
        fbUser.photoURL || undefined,
      )

      await createUserDocument(fbUser.uid, {
        ...defaultData,
        isEmailVerified: fbUser.emailVerified,
      })

      toast.success(`Welcome back, ${fbUser.displayName?.split(' ')[0]}! 🎵`)
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'auth/popup-closed-by-user') return
      toast.error(error.message || ERROR_MESSAGES.GENERIC)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const loginWithEmail = useCallback(async (
    credentials: LoginCredentials,
  ): Promise<void> => {
    try {
      setIsLoading(true)
      await signInWithEmail(credentials.email, credentials.password)
      toast.success('Welcome back! 🎵')
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      let message = ERROR_MESSAGES.GENERIC

      if (error.code === 'auth/user-not-found')  message = 'No account found with this email.'
      if (error.code === 'auth/wrong-password')  message = 'Incorrect password. Please try again.'
      if (error.code === 'auth/invalid-email')   message = 'Please enter a valid email address.'
      if (error.code === 'auth/too-many-requests')message = 'Too many attempts. Please try later.'
      if (error.code === 'auth/user-disabled')   message = 'This account has been disabled.'

      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (
    credentials: SignupCredentials,
  ): Promise<void> => {
    try {
      setIsLoading(true)

      // Check username availability
      const taken = await isUsernameTaken(credentials.username)
      if (taken) {
        toast.error('This username is already taken. Please choose another.')
        return
      }

      const result = await signUpWithEmail(
        credentials.email,
        credentials.password,
        credentials.displayName,
      )

      // Create Firestore user document
      const defaultData = buildDefaultUser(
        result.user.uid,
        credentials.email,
        credentials.displayName,
      )

      await createUserDocument(result.user.uid, {
        ...defaultData,
        username:        credentials.username.toLowerCase(),
        isEmailVerified: false,
      })

      toast.success('Account created! Please verify your email. 📧')
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      let message = ERROR_MESSAGES.GENERIC

      if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists.'
      if (error.code === 'auth/invalid-email')         message = 'Please enter a valid email address.'
      if (error.code === 'auth/weak-password')         message = 'Password must be at least 6 characters.'

      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut()

      // Clear local storage
      Object.values(STORAGE_KEYS).forEach(key => {
        try { localStorage.removeItem(key) } catch {}
      })

      toast.success('Logged out successfully.')
      router.push('/')
    } catch (err) {
      toast.error(ERROR_MESSAGES.GENERIC)
      throw err
    }
  }, [router])

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await sendPasswordReset(email)
      toast.success('Password reset email sent! Check your inbox. 📧')
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if email exists — security best practice
        toast.success('If this email exists, a reset link has been sent.')
        return
      }
      toast.error(ERROR_MESSAGES.GENERIC)
      throw err
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    if (!auth.currentUser) throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
    try {
      await updateUserDocument(auth.currentUser.uid, data)
      setUser(prev => prev ? { ...prev, ...data } : null)
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED)
    } catch (err) {
      toast.error(ERROR_MESSAGES.GENERIC)
      throw err
    }
  }, [])

  const getToken = useCallback(async (): Promise<string | null> => {
    return getIdToken(false)
  }, [])

  // ── Context value ────────────────────────────────────────
  const value: AuthContextValue = {
    // State
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    isEmailVerified,
    notifications,
    unreadCount,

    // Role helpers
    isUser,
    isCreator,
    isPremium,
    isAdmin,
    isOwner,
    hasRole,
    hasPlan,

    // Auth actions
    loginWithGoogle,
    loginWithEmail,
    register,
    logout,
    forgotPassword,

    // Profile
    refreshUser,
    updateProfile,

    // Token
    getToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── HOOK ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ─── ROLE GUARD HOC ─────────────────────────────────────────────────────────

interface WithAuthProps {
  children:     ReactNode
  requiredRole?: UserRole
  requiredPlan?: SubscriptionPlan
  fallback?:    ReactNode
  redirectTo?:  string
}

export function WithAuth({
  children,
  requiredRole,
  requiredPlan,
  fallback,
  redirectTo = '/login',
}: WithAuthProps) {
  const { isAuthenticated, isLoading, hasRole, hasPlan, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="loading-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 5 C20 5 8 12 8 22 C8 28 13 32 20 32 C27 32 32 28 32 22 C32 12 20 5 20 5Z"
              fill="rgba(253,250,244,0.9)"
            />
          </svg>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="font-display text-2xl text-walnut-700">Access Restricted</h2>
        <p className="text-brown-400 text-sm">
          You need {requiredRole} access to view this page.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  if (requiredPlan && !hasPlan(requiredPlan)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <div className="text-6xl">⭐</div>
        <h2 className="font-display text-2xl text-walnut-700">Premium Feature</h2>
        <p className="text-brown-400 text-sm text-center max-w-xs">
          Upgrade to {requiredPlan} to unlock this feature.
        </p>
        <button
          onClick={() => router.push('/dashboard/settings?tab=billing')}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Upgrade Now
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthContext
