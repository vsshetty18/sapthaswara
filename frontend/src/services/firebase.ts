/* ============================================================
   SVARAVERSE AI — Firebase Configuration & Services
   Auth | Firestore | Storage | Cloud Messaging
   ============================================================ */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type StorageReference,
} from 'firebase/storage'
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from 'firebase/messaging'

// ─── FIREBASE CONFIG ────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// ─── INITIALIZE FIREBASE (singleton) ────────────────────────────────────────

const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp()

// ─── SERVICE INSTANCES ──────────────────────────────────────────────────────

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)

// Messaging only available in browser
let messaging: Messaging | null = null
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app)
  } catch {
    console.warn('Firebase Messaging not supported in this environment.')
  }
}
export { messaging }

// ─── AUTH PROVIDERS ─────────────────────────────────────────────────────────

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ============================================================
// AUTH SERVICES
// ============================================================

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const result = await signInWithPopup(auth, googleProvider)
  return result
}

/**
 * Sign in with email + password
 */
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Create account with email + password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await sendEmailVerification(result.user)
  return result
}

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email)
}

/**
 * Send email verification to current user
 */
export const resendEmailVerification = async (): Promise<void> => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser)
  }
}

/**
 * Sign out current user
 */
export const firebaseSignOut = async (): Promise<void> => {
  return signOut(auth)
}

/**
 * Update display name and/or photo URL
 */
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string,
): Promise<void> => {
  if (!auth.currentUser) throw new Error('No authenticated user')
  await updateProfile(auth.currentUser, {
    ...(displayName && { displayName }),
    ...(photoURL    && { photoURL }),
  })
}

/**
 * Update user email (requires recent login)
 */
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('No authenticated user')
  await updateEmail(auth.currentUser, newEmail)
}

/**
 * Update user password (requires recent login)
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('No authenticated user')
  await updatePassword(auth.currentUser, newPassword)
}

/**
 * Re-authenticate user with current password (before sensitive operations)
 */
export const reauthenticate = async (currentPassword: string): Promise<void> => {
  if (!auth.currentUser?.email) throw new Error('No authenticated user')
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    currentPassword,
  )
  await reauthenticateWithCredential(auth.currentUser, credential)
}

/**
 * Get current Firebase ID token for API requests
 */
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  if (!auth.currentUser) return null
  return auth.currentUser.getIdToken(forceRefresh)
}

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (
  callback: (user: FirebaseUser | null) => void,
) => {
  return onAuthStateChanged(auth, callback)
}

// ============================================================
// FIRESTORE SERVICES
// ============================================================

// ── Firestore Collection Names ──────────────────────────────
export const COLLECTIONS = {
  USERS:         'users',
  SONGS:         'songs',
  PLAYLISTS:     'playlists',
  PLANNER:       'planner',
  REMINDERS:     'reminders',
  MILESTONES:    'milestones',
  NOTIFICATIONS: 'notifications',
  AI_SESSIONS:   'ai_sessions',
  COMMUNITY:     'community_posts',
  COMMENTS:      'comments',
  ANALYTICS:     'analytics',
  SUBSCRIPTIONS: 'subscriptions',
} as const

// ── User Document ───────────────────────────────────────────

/**
 * Create or update user document in Firestore
 */
export const createUserDocument = async (
  uid: string,
  data: Partial<DocumentData>,
): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid)
  const snap    = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid,
      ...data,
      totalSongs:          0,
      totalPracticeHours:  0,
      currentStreak:       0,
      longestStreak:       0,
      totalUploads:        0,
      createdAt:           serverTimestamp(),
      updatedAt:           serverTimestamp(),
    })
  } else {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * Get user document by UID
 */
export const getUserDocument = async (
  uid: string,
): Promise<DocumentData | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Update user document fields
 */
export const updateUserDocument = async (
  uid: string,
  data: Partial<DocumentData>,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Subscribe to real-time user document changes
 */
export const subscribeToUser = (
  uid: string,
  callback: (data: DocumentData | null) => void,
) => {
  return onSnapshot(doc(db, COLLECTIONS.USERS, uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

// ── Notifications ───────────────────────────────────────────

/**
 * Subscribe to real-time notifications for a user
 */
export const subscribeToNotifications = (
  uid: string,
  callback: (notifications: DocumentData[]) => void,
) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', uid),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc'),
    limit(30),
  )

  return onSnapshot(q, (snap: QuerySnapshot) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  notificationId: string,
): Promise<void> => {
  await updateDoc(
    doc(db, COLLECTIONS.NOTIFICATIONS, notificationId),
    { isRead: true },
  )
}

/**
 * Mark all notifications read for a user
 */
export const markAllNotificationsRead = async (uid: string): Promise<void> => {
  const q    = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', uid),
    where('isRead', '==', false),
  )
  const snap = await getDocs(q)
  const updates = snap.docs.map(d =>
    updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, d.id), { isRead: true }),
  )
  await Promise.all(updates)
}

// ── AI Sessions ─────────────────────────────────────────────

/**
 * Save AI coach message to Firestore
 */
export const saveAIMessage = async (
  uid: string,
  sessionId: string,
  message: DocumentData,
): Promise<void> => {
  const sessionRef = doc(db, COLLECTIONS.AI_SESSIONS, `${uid}_${sessionId}`)
  const snap       = await getDoc(sessionRef)

  if (!snap.exists()) {
    await setDoc(sessionRef, {
      userId:    uid,
      sessionId,
      messages:  [message],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } else {
    await updateDoc(sessionRef, {
      messages:  arrayUnion(message),
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * Get AI coach session history
 */
export const getAISession = async (
  uid: string,
  sessionId: string,
): Promise<DocumentData | null> => {
  const snap = await getDoc(
    doc(db, COLLECTIONS.AI_SESSIONS, `${uid}_${sessionId}`),
  )
  return snap.exists() ? snap.data() : null
}

// ── Milestones ──────────────────────────────────────────────

/**
 * Save unlocked milestone
 */
export const saveMilestone = async (
  uid: string,
  milestone: DocumentData,
): Promise<void> => {
  const ref = doc(
    db,
    COLLECTIONS.USERS,
    uid,
    'milestones',
    milestone.type,
  )
  await setDoc(ref, {
    ...milestone,
    achievedAt: serverTimestamp(),
    isNew:      true,
  })
}

/**
 * Subscribe to user milestones
 */
export const subscribeToMilestones = (
  uid: string,
  callback: (milestones: DocumentData[]) => void,
) => {
  const milestonesRef = collection(db, COLLECTIONS.USERS, uid, 'milestones')
  return onSnapshot(milestonesRef, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// ── Analytics ───────────────────────────────────────────────

/**
 * Log daily practice session
 */
export const logPracticeSession = async (
  uid: string,
  songId: string,
  durationMin: number,
): Promise<void> => {
  const today   = new Date().toISOString().split('T')[0]
  const dateRef = doc(db, COLLECTIONS.ANALYTICS, `${uid}_${today}`)
  const snap    = await getDoc(dateRef)

  if (!snap.exists()) {
    await setDoc(dateRef, {
      userId:          uid,
      date:            today,
      practiceMinutes: durationMin,
      songsLearned:    0,
      songsRecorded:   0,
      songsPosted:     0,
      sessions:        [{ songId, durationMin, timestamp: serverTimestamp() }],
      createdAt:       serverTimestamp(),
    })
  } else {
    await updateDoc(dateRef, {
      practiceMinutes: increment(durationMin),
      sessions:        arrayUnion({ songId, durationMin, timestamp: Timestamp.now() }),
    })
  }

  // Update user's total practice hours
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    totalPracticeHours: increment(durationMin / 60),
    updatedAt:          serverTimestamp(),
  })
}

/**
 * Get practice heatmap data for a user (last 365 days)
 */
export const getPracticeHeatmap = async (
  uid: string,
): Promise<DocumentData[]> => {
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const yearAgoStr = yearAgo.toISOString().split('T')[0]

  const q = query(
    collection(db, COLLECTIONS.ANALYTICS),
    where('userId', '==', uid),
    where('date', '>=', yearAgoStr),
    orderBy('date', 'asc'),
  )

  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// ── Streak Management ───────────────────────────────────────

/**
 * Update user streak based on today's activity
 */
export const updateStreak = async (uid: string): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid)
  const snap    = await getDoc(userRef)

  if (!snap.exists()) return

  const data         = snap.data()
  const today        = new Date().toISOString().split('T')[0]
  const lastPractice = data.lastPracticeDate

  if (lastPractice === today) return  // Already updated today

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const currentStreak  = data.currentStreak  || 0
  const longestStreak  = data.longestStreak  || 0
  const newStreak      = lastPractice === yesterdayStr ? currentStreak + 1 : 1
  const newLongest     = Math.max(newStreak, longestStreak)

  await updateDoc(userRef, {
    currentStreak:   newStreak,
    longestStreak:   newLongest,
    lastPracticeDate:today,
    updatedAt:       serverTimestamp(),
  })
}

// ============================================================
// STORAGE SERVICES
// ============================================================

export type UploadProgressCallback = (progress: number) => void

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export const uploadFile = (
  path: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef: StorageReference = ref(storage, path)
    const uploadTask: UploadTask       = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(Math.round(progress))
      },
      (error) => {
        console.error('Upload error:', error)
        reject(error)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(downloadURL)
      },
    )
  })
}

/**
 * Upload user avatar
 */
export const uploadAvatar = async (
  uid: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> => {
  const ext  = file.name.split('.').pop()
  const path = `avatars/${uid}/avatar.${ext}`
  const url  = await uploadFile(path, file, onProgress)
  await updateUserProfile(undefined, url)
  await updateUserDocument(uid, { photoURL: url })
  return url
}

/**
 * Upload song audio file
 */
export const uploadSongAudio = async (
  uid: string,
  songId: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> => {
  const ext  = file.name.split('.').pop()
  const path = `songs/${uid}/${songId}/audio.${ext}`
  return uploadFile(path, file, onProgress)
}

/**
 * Upload song cover image
 */
export const uploadSongCover = async (
  uid: string,
  songId: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> => {
  const ext  = file.name.split('.').pop()
  const path = `songs/${uid}/${songId}/cover.${ext}`
  return uploadFile(path, file, onProgress)
}

/**
 * Upload generated poster
 */
export const uploadPoster = async (
  uid: string,
  posterId: string,
  blob: Blob,
): Promise<string> => {
  const path = `posters/${uid}/${posterId}.png`
  return new Promise((resolve, reject) => {
    const storageRef  = ref(storage, path)
    const uploadTask  = uploadBytesResumable(storageRef, blob)
    uploadTask.on('state_changed', null,
      reject,
      async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    )
  })
}

/**
 * Delete a file from Firebase Storage by its URL
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
  } catch (error) {
    console.warn('Could not delete file:', error)
  }
}

// ============================================================
// CLOUD MESSAGING (Push Notifications)
// ============================================================

const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging || !FCM_VAPID_KEY) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY })
    return token || null
  } catch (error) {
    console.warn('FCM token error:', error)
    return null
  }
}

/**
 * Subscribe to foreground push messages
 */
export const onForegroundMessage = (
  callback: (payload: unknown) => void,
) => {
  if (!messaging) return () => {}
  return onMessage(messaging, callback)
}

// ============================================================
// UTILITY HELPERS
// ============================================================

/**
 * Convert Firestore Timestamp to ISO string
 */
export const timestampToISO = (
  timestamp: Timestamp | null | undefined,
): string => {
  if (!timestamp) return new Date().toISOString()
  return timestamp.toDate().toISOString()
}

/**
 * Convert ISO string to Firestore Timestamp
 */
export const isoToTimestamp = (iso: string): Timestamp => {
  return Timestamp.fromDate(new Date(iso))
}

/**
 * Get storage path from download URL
 */
export const getStoragePath = (url: string): string => {
  const decodedUrl = decodeURIComponent(url)
  const pathMatch  = decodedUrl.match(/\/o\/(.+?)\?/)
  return pathMatch ? pathMatch[1] : ''
}

/**
 * Check if user document exists
 */
export const userExists = async (uid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists()
}

/**
 * Check if username is taken
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q    = query(
    collection(db, COLLECTIONS.USERS),
    where('username', '==', username.toLowerCase()),
    limit(1),
  )
  const snap = await getDocs(q)
  return !snap.empty
}

export default app
