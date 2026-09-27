import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect whether valid replacement Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== '' &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== ''
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  const rawConfig = firebaseConfig as any;
  firestoreInstance = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, rawConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const auth = authInstance;
export const firestore = firestoreInstance;
export default app;
