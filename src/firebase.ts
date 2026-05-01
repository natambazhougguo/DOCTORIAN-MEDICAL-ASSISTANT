import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const instagramProvider = new OAuthProvider('instagram.com');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signInWithGoogle = async () => {
  console.log("Starting Google Sign-In...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Successfully signed in with Google:", user.email);
    
    // Create user profile if it doesn't exist
    const userRef = doc(db, 'users', user.uid);
    let userDoc;
    try {
      userDoc = await getDoc(userRef);
    } catch (e) {
      console.error("Error fetching user profile:", e);
      // If we can't fetch it, we'll try to set it anyway
    }
    
    if (!userDoc?.exists()) {
      console.log("Creating new user profile for:", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: new Date().toISOString()
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    // Provide a more user-friendly error message if it's a popup blocker issue
    if (error instanceof Error && error.message.includes('popup-blocked')) {
      throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    throw error;
  }
};

export const signInWithSocial = async (provider: GoogleAuthProvider | GithubAuthProvider | FacebookAuthProvider | OAuthProvider) => {
  console.log(`Starting social sign-in with provider: ${provider.providerId}...`);
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error(`Error signing in with ${provider.providerId}`, error);
    if (error instanceof Error && error.message.includes('popup-blocked')) {
      throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
