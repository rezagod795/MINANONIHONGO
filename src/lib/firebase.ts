import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
  signInAnonymously,
  updateProfile,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot,
  getDocFromServer,
  query,
  collection,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

// Types
import { VocabItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

import firebaseConfig from '../../firebase-applet-config.json';

const isConfigValid = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "");

export const isFirebaseConfigured = () => isConfigValid;
export const getFirebaseProjectId = () => firebaseConfig?.projectId || "spatial-striker-psjh2";

// Lazy initialization helpers
let _db: any = null;
let _auth: any = null;

const getFirebaseApp = () => {
  if (!isConfigValid) {
    throw new Error('Firebase belum terkonfigurasi. Silakan lengkapi setup Firebase di AI Studio.');
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

export const getDb = () => {
  if (!_db) {
    const app = getFirebaseApp();
    _db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return _db;
};

export const getAppAuth = () => {
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
  }
  return _auth;
};

// Error Handler
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getAppAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Avoid throwing a fatal uncaught exception for read/list operations that get cancelled on logout/unauthenticated
  const isUnauthenticatedRead = (operationType === OperationType.GET || operationType === OperationType.LIST) && !auth.currentUser;
  if (isUnauthenticatedRead) {
    console.warn(`Firestore read/list permission denied because user is unauthenticated (handled gracefully).`);
    return;
  }

  throw new Error(JSON.stringify(errInfo));
}

// Auth Functions
export const loginWithGoogle = async () => {
  try {
    const auth = getAppAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const loginWithGoogleRedirect = async () => {
  try {
    const auth = getAppAuth();
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Redirect Login Error:', error);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const auth = getAppAuth();
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error('Redirect Result Error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const auth = getAppAuth();
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error('Email Login Error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, nickname: string) => {
  try {
    const auth = getAppAuth();
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && nickname) {
      await updateProfile(result.user, { displayName: nickname });
    }
    return result.user;
  } catch (error) {
    console.error('Email Registration Error:', error);
    throw error;
  }
};

export const loginAsGuest = async (nickname: string) => {
  try {
    const auth = getAppAuth();
    const result = await signInAnonymously(auth);
    if (result.user && nickname) {
      await updateProfile(result.user, { displayName: nickname });
    }
    return result.user;
  } catch (error: any) {
    console.error('Guest Login Error:', error);
    const errCode = error?.code || "";
    const errMsg = error?.message || "";
    if (errCode === 'auth/admin-restricted-operation' || errMsg.includes('admin-restricted-operation')) {
      const enrichedMsg = "auth/admin-restricted-operation: Fitur 'Anonymous Sign-In' (Login Tamu) belum aktif di Firebase Console Anda.\n\n" +
        "Cara mengaktifkannya sangat mudah:\n" +
        "1. Buka Firebase Console proyek Anda.\n" +
        "2. Masuk ke menu \"Authentication\" > tab \"Sign-in method\".\n" +
        "3. Klik tombol \"Add new provider\" (Tambah penyedia baru) di kolom 'Sign-in-providers'.\n" +
        "4. Pilih \"Anonymous\" (Tamu), aktifkan toggle status Ke 'Enable', lalu klik \"Save\" (Simpan).\n" +
        "5. Setelah disimpan, ulangi langkah Anda!";
      const errorWithContext = new Error(enrichedMsg);
      (errorWithContext as any).code = 'auth/admin-restricted-operation';
      throw errorWithContext;
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    const auth = getAppAuth();
    if (auth.currentUser) {
      await updatePresence(auth.currentUser.uid, null);
    }
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
  }
};

// Progress Functions
export const saveUserProgress = async (
  userId: string, 
  highScores: Record<number, number>, 
  favorites: VocabItem[]
) => {
  if (userId.startsWith('local_guest_')) return;
  const path = `progress/${userId}`;
  try {
    const db = getDb();
    await setDoc(doc(db, path), {
      uid: userId,
      highScores,
      favorites,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToUserProgress = (userId: string, callback: (data: any) => void) => {
  if (userId.startsWith('local_guest_')) {
    return () => {}; // return empty unsubscriber
  }
  const path = `progress/${userId}`;
  try {
    const db = getDb();
    return onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// Presence Functions
export const updatePresence = async (userId: string, user: FirebaseUser | null) => {
  if (userId.startsWith('local_guest_')) return;
  const path = `presence/${userId}`;
  const db = getDb();
  try {
    if (!user) {
      await deleteDoc(doc(db, path));
      return;
    }
    await setDoc(doc(db, path), {
      uid: userId,
      name: user.displayName || user.email || 'Anonymous',
      photo: user.photoURL,
      lastSeen: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    // Silently fail for presence if needed, or handle
    console.warn('Presence update failed:', error);
  }
};

export const subscribeToPresence = (callback: (users: any[]) => void) => {
  const path = 'presence';
  try {
    const auth = getAppAuth();
    if (!auth.currentUser) {
      console.warn("Mencoba berlangganan 'presence' tanpa session Firebase. Kembali kosong.");
      return () => {};
    }
    const db = getDb();
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      callback(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// Visitor Tracking Functions
export const logVisitor = async () => {
  const visitorId = Math.random().toString(36).substring(2, 12);
  const path = `visitors/${visitorId}`;
  try {
    if (!isConfigValid) return;
    const db = getDb();
    await setDoc(doc(db, path), {
      sessionId: visitorId,
      userAgent: navigator.userAgent.substring(0, 500),
      platform: (navigator as any).platform || 'unknown',
      language: navigator.language,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: serverTimestamp(),
      path: window.location.pathname + window.location.search
    });
  } catch (error) {
    console.warn('Visitor logging failed:', error);
  }
};

export const subscribeToVisitors = (callback: (visitors: any[]) => void) => {
  const path = 'visitors';
  try {
    const db = getDb();
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      // Sort by timestamp if available
      visitors.sort((a, b) => {
        const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return tb - ta;
      });
      callback(visitors);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// Duel Functions
export const createDuel = async (user: FirebaseUser, level: number, vocabList: VocabItem[]) => {
  const duelId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const path = `duels/${duelId}`;
  try {
    const db = getDb();
    const duelData = {
      id: duelId,
      creator: {
        uid: user.uid,
        name: user.displayName || user.email,
        photo: user.photoURL
      },
      level,
      vocabList,
      currentIndex: 0,
      turn: 'creator',
      turnStartedAt: Date.now(),
      status: 'pending',
      scores: { creator: 0, opponent: 0 },
      lives: { creator: 5, opponent: 5 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, path), duelData);
    return duelId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const joinDuel = async (user: FirebaseUser, duelId: string) => {
  const path = `duels/${duelId}`;
  try {
    const db = getDb();
    const docRef = doc(db, path);
    // Check if duel exists first
    const snapshot = await getDocFromServer(docRef);
    if (!snapshot.exists()) {
      throw new Error(`Duel dengan ID ${duelId} tidak ditemukan.`);
    }
    
    const data = snapshot.data();
    if (data.status !== 'pending') {
      throw new Error("Duel ini sudah penuh atau sudah dimulai.");
    }

    if (data.creator.uid === user.uid) {
      throw new Error("Anda tidak bisa bergabung ke duel yang Anda buat sendiri.");
    }

    const opponentData = {
      uid: user.uid,
      name: user.displayName || user.email,
      photo: user.photoURL
    };

    await setDoc(docRef, {
      opponent: opponentData,
      status: 'joined',
      updatedAt: serverTimestamp()
    }, { merge: true });

    return {
      ...data,
      opponent: opponentData,
      status: 'joined',
      id: duelId
    } as any;
  } catch (error: any) {
    if (error?.message && error.message.includes('tidak ditemukan')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateDuelShared = async (duelId: string, data: any) => {
  const path = `duels/${duelId}`;
  try {
    const db = getDb();
    await setDoc(doc(db, path), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const subscribeToDuel = (duelId: string, callback: (data: any) => void) => {
  const path = `duels/${duelId}`;
  try {
    const db = getDb();
    return onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// Health check as requested in integration guidelines
export const testConnection = async () => {
  try {
    const db = getDb();
    const auth = getAppAuth();
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'progress', auth.currentUser.uid));
    }
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
};
