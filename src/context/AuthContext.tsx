import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../lib/firebase';
import { db } from '../lib/db';
import firebaseConfig from '../../firebase-applet-config.json';

export interface UserBusinessProfile {
  uid?: string;
  fullName: string;
  businessName: string;
  email: string;
  businessCategory?: string;
  country?: string;
  currency?: string;
  currencySymbol?: string;
  description?: string;
  phone?: string;
  photoURL?: string;
  provider?: string;
  onboardingAnswers?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding';

interface AuthContextType {
  currentUser: UserBusinessProfile | null;
  pendingUser: (Partial<UserBusinessProfile> & { password?: string }) | null;
  resetEmail: string | null;
  currentAuthMode: AuthMode | null;
  isDashboardOpen: boolean;
  isLoading: boolean;
  isAuthReady: boolean;
  authError: string | null;
  unauthorizedDomain: string | null;
  firebaseProjectId: string;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  openDashboard: () => void;
  closeDashboard: () => void;
  setPendingUser: (user: (Partial<UserBusinessProfile> & { password?: string }) | null) => void;
  setResetEmail: (email: string | null) => void;
  setAuthError: (error: string | null) => void;
  clearDomainError: () => void;
  completeSignup: (data: { fullName: string; businessName: string; email: string; password?: string }) => Promise<boolean>;
  completeOnboarding: (questionnaireData: {
    businessCategory: string;
    country: string;
    currency: string;
    currencySymbol?: string;
    description?: string;
    onboardingAnswers: Record<string, any>;
    seedProduct?: {
      name: string;
      sellingPrice: number;
      costPrice: number | null;
      stock: number;
    };
  }) => Promise<void>;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  loginDemoUser: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kopa_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserBusinessProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingUser, setPendingUser] = useState<(Partial<UserBusinessProfile> & { password?: string }) | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [currentAuthMode, setCurrentAuthMode] = useState<AuthMode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  const currentUserRef = useRef<UserBusinessProfile | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const firebaseProjectId = firebaseConfig?.projectId || 'kopa-6ddf5';

  const clearDomainError = () => {
    setUnauthorizedDomain(null);
    setAuthError(null);
  };

  // Fast helper to apply & cache user profile
  const applyUserProfile = (profile: UserBusinessProfile) => {
    setCurrentUser(profile);
    currentUserRef.current = profile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}

    db.bindUser(profile.uid || 'kopa_user', {
      businessName: profile.businessName,
      category: profile.businessCategory || 'General',
      country: profile.country || 'Nigeria',
      currency: profile.currency || 'NGN',
      currencySymbol: profile.currencySymbol || '₦',
      ownerName: profile.fullName,
      email: profile.email,
      description: profile.description,
      onboardingAnswers: profile.onboardingAnswers,
    });
  };

  // Helper to remove undefined values for Firestore
  const cleanFirestoreData = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(cleanFirestoreData);
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned;
  };

  // Background non-blocking sync with Firestore
  const backgroundSaveFirestoreProfile = (uid: string, profile: UserBusinessProfile) => {
    if (!firestore || !uid) return;
    const cleanedProfile = cleanFirestoreData(profile);
    setDoc(doc(firestore, 'users', uid), cleanedProfile, { merge: true }).catch((err) => {
      console.warn('Background Firestore profile save notice:', err);
    });
  };

  // Helper to load or initialize Firestore business profile
  const syncFirebaseUserProfile = async (
    firebaseUser: FirebaseUser,
    customDefaults?: Partial<UserBusinessProfile>
  ): Promise<UserBusinessProfile> => {
    let profile: UserBusinessProfile;
    const fs = firestore;

    if (fs) {
      try {
        const userDocRef = doc(fs, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserBusinessProfile;
          profile = {
            ...data,
            uid: firebaseUser.uid,
            email: firebaseUser.email || data.email || '',
            fullName: data.fullName || firebaseUser.displayName || customDefaults?.fullName || 'Business Owner',
            businessName: data.businessName || customDefaults?.businessName || `${firebaseUser.displayName || 'My'} Business`,
          };
        } else {
          const rawName = customDefaults?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Business Owner';
          const bizName = customDefaults?.businessName || (firebaseUser.displayName ? `${firebaseUser.displayName}'s Business` : `${rawName}'s Business`);
          profile = {
            uid: firebaseUser.uid,
            fullName: rawName,
            businessName: bizName,
            email: firebaseUser.email || customDefaults?.email || '',
            businessCategory: customDefaults?.businessCategory || 'Retail & General Merchant',
            country: customDefaults?.country || 'Nigeria',
            currency: customDefaults?.currency || 'NGN',
            currencySymbol: customDefaults?.currencySymbol || '₦',
            photoURL: firebaseUser.photoURL || undefined,
            provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          backgroundSaveFirestoreProfile(firebaseUser.uid, profile);
        }
      } catch (err) {
        const rawName = customDefaults?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Business Owner';
        const bizName = customDefaults?.businessName || `${rawName}'s Business`;
        profile = {
          uid: firebaseUser.uid,
          fullName: rawName,
          businessName: bizName,
          email: firebaseUser.email || '',
          businessCategory: 'Retail & General Merchant',
          country: 'Nigeria',
          currency: 'NGN',
          currencySymbol: '₦',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
      }
    } else {
      const rawName = customDefaults?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Business Owner';
      const bizName = customDefaults?.businessName || `${rawName}'s Business`;
      profile = {
        uid: firebaseUser.uid,
        fullName: rawName,
        businessName: bizName,
        email: firebaseUser.email || '',
        businessCategory: 'Retail & General Merchant',
        country: 'Nigeria',
        currency: 'NGN',
        currencySymbol: '₦',
        createdAt: new Date().toISOString(),
      };
    }

    return profile;
  };

  // Sync with real Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user is already active in memory with matching UID, avoid duplicate delays
        if (currentUserRef.current?.uid === firebaseUser.uid) {
          setIsAuthReady(true);
          return;
        }

        try {
          const profile = await syncFirebaseUserProfile(firebaseUser);
          applyUserProfile(profile);
        } catch (err) {
          console.error('Error syncing auth state with Firestore:', err);
        }
      } else {
        setCurrentUser(null);
        currentUserRef.current = null;
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        db.unbindUser();
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Initial route listener (read-only, does not rewrite URL on navigation)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const isDashboardRoute = [
        '#dashboard',
        '#workspace',
        '#transactions',
        '#products',
        '#customers',
        '#expenses',
        '#ask-kopa',
        '#passport',
        '#connected-apps',
        '#settings',
      ].includes(hash);

      if (hash === '#login') {
        setCurrentAuthMode('login');
        setIsDashboardOpen(false);
      } else if (hash === '#signup') {
        setCurrentAuthMode('signup');
        setIsDashboardOpen(false);
      } else if (hash === '#forgot-password') {
        setCurrentAuthMode('forgot-password');
        setIsDashboardOpen(false);
      } else if (hash === '#reset-password') {
        setCurrentAuthMode('reset-password');
        setIsDashboardOpen(false);
      } else if (isDashboardRoute) {
        if (currentUserRef.current || (auth && auth.currentUser)) {
          setIsDashboardOpen(true);
          setCurrentAuthMode(null);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAuth = (mode: AuthMode) => {
    if (currentUserRef.current || (auth && auth.currentUser)) {
      setAuthError(null);
      setUnauthorizedDomain(null);
      setCurrentAuthMode(null);
      setIsDashboardOpen(true);
      return;
    }
    setAuthError(null);
    setUnauthorizedDomain(null);
    setIsDashboardOpen(false);
    setCurrentAuthMode(mode);
  };

  const closeAuth = () => {
    setAuthError(null);
    setUnauthorizedDomain(null);
    setCurrentAuthMode(null);
  };

  const openDashboard = () => {
    if (!currentUser && !(auth && auth.currentUser)) {
      openAuth('login');
      setAuthError('Please sign in to access your business workspace.');
      return;
    }
    setAuthError(null);
    setUnauthorizedDomain(null);
    setCurrentAuthMode(null);
    setIsDashboardOpen(true);
  };

  const closeDashboard = () => {
    setIsDashboardOpen(false);
  };

  // Google Sign-In implementation
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    setUnauthorizedDomain(null);

    if (!auth) {
      setAuthError('Firebase Authentication is not available.');
      setIsLoading(false);
      return false;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Profile setup
      const rawName = user.displayName || user.email?.split('@')[0] || 'Business Owner';
      const initialProfile: UserBusinessProfile = {
        uid: user.uid,
        fullName: rawName,
        businessName: `${rawName}'s Business`,
        email: user.email || '',
        businessCategory: 'Retail & General Merchant',
        country: 'Nigeria',
        currency: 'NGN',
        currencySymbol: '₦',
        photoURL: user.photoURL || undefined,
        provider: 'google.com',
        createdAt: new Date().toISOString(),
      };

      applyUserProfile(initialProfile);
      setPendingUser(initialProfile);
      setIsLoading(false);
      setCurrentAuthMode('onboarding');

      // Background check if user already completed onboarding
      syncFirebaseUserProfile(user).then((fullProfile) => {
        applyUserProfile(fullProfile);
        if (fullProfile.onboardingAnswers) {
          closeAuth();
          setIsDashboardOpen(true);
        }
      }).catch(() => {});

      return true;
    } catch (err: any) {
      console.warn('Google Sign-In response code:', err.code, err.message);
      setIsLoading(false);

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setAuthError(null);
        return false;
      } else if (err.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        setUnauthorizedDomain(host);
        setAuthError(
          `Domain "${host}" is not authorized in Firebase. Add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
        return false;
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError(
          `Google Sign-In is disabled in Firebase project (${firebaseProjectId}). Enable Google under Firebase Console -> Authentication -> Sign-in method.`
        );
        return false;
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Popup was blocked by your browser. Please allow popups for Google Sign-In.');
        return false;
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account already exists with this email address under a different login method.');
        return false;
      } else {
        setAuthError(err.message || 'Failed to authenticate with Google. Please try again.');
        return false;
      }
    }
  };

  // Demo Merchant Login (kept clean for tests without url shifts)
  const loginDemoUser = () => {
    const demoProfile: UserBusinessProfile = {
      uid: 'demo_merchant_aminabello',
      fullName: 'Amina Bello',
      businessName: 'Amina Fashion & Fabrics',
      email: 'amina@fashion.ng',
      businessCategory: 'Fashion & Apparel',
      country: 'Nigeria',
      currency: 'NGN',
      currencySymbol: '₦',
      description: 'Handmade traditional textiles, adire fabrics, and ready-to-wear garments.',
      provider: 'demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applyUserProfile(demoProfile);
    closeAuth();
    setIsDashboardOpen(true);
  };

  // Sign-Up with Firebase Authentication + Onboarding Transition
  const completeSignup = async (data: {
    fullName: string;
    businessName: string;
    email: string;
    password?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    setUnauthorizedDomain(null);

    if (!auth) {
      setIsLoading(false);
      setAuthError('Firebase Authentication is not available.');
      return false;
    }

    const email = data.email.trim();
    const password = data.password || 'TemporaryPass123!';
    const fullName = data.fullName.trim();
    const businessName = data.businessName.trim();

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Build Profile immediately
      const profile: UserBusinessProfile = {
        uid: user.uid,
        fullName,
        businessName,
        email,
        businessCategory: 'Retail & General Merchant',
        country: 'Nigeria',
        currency: 'NGN',
        currencySymbol: '₦',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set user as pending and activate onboarding questionnaire
      setPendingUser({
        ...profile,
        password,
      });
      applyUserProfile(profile);
      setIsLoading(false);
      setCurrentAuthMode('onboarding');

      // Background non-blocking persistence
      if (fullName) {
        updateProfile(user, { displayName: fullName }).catch(() => {});
      }
      backgroundSaveFirestoreProfile(user.uid, profile);

      return true;
    } catch (err: any) {
      console.warn('Firebase Auth signup exception:', err);
      setIsLoading(false);

      if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('The email address entered is not valid.');
      } else {
        setAuthError(err.message || 'Registration failed. Please check your details and try again.');
      }
      return false;
    }
  };

  // Sign-In with Firebase Authentication
  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    setUnauthorizedDomain(null);

    if (!auth) {
      setIsLoading(false);
      setAuthError('Firebase Authentication is not available.');
      return false;
    }

    if (!password) {
      setIsLoading(false);
      setAuthError('Please enter your password.');
      return false;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // Profile load
      const rawName = user.displayName || user.email?.split('@')[0] || 'Business Owner';
      const initialProfile: UserBusinessProfile = {
        uid: user.uid,
        fullName: rawName,
        businessName: `${rawName}'s Business`,
        email: user.email || email.trim(),
        businessCategory: 'Retail & General Merchant',
        country: 'Nigeria',
        currency: 'NGN',
        currencySymbol: '₦',
        createdAt: new Date().toISOString(),
      };

      applyUserProfile(initialProfile);
      setIsLoading(false);
      closeAuth();
      setIsDashboardOpen(true);

      // Background Firestore lookup & sync
      syncFirebaseUserProfile(user).then((fullProfile) => {
        applyUserProfile(fullProfile);
      });

      return true;
    } catch (err: any) {
      console.warn('Firebase login attempt error:', err);
      setIsLoading(false);

      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found'
      ) {
        setAuthError('Incorrect email or password. Please verify your credentials.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (err.code === 'auth/user-disabled') {
        setAuthError('This user account has been deactivated.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please reset your password or try again shortly.');
      } else {
        setAuthError(err.message || 'Sign in failed. Please check your credentials.');
      }
      return false;
    }
  };

  const completeOnboarding = async (questionnaireData: {
    businessCategory: string;
    country: string;
    currency: string;
    currencySymbol?: string;
    description?: string;
    onboardingAnswers: Record<string, any>;
    seedProduct?: {
      name: string;
      sellingPrice: number;
      costPrice: number | null;
      stock: number;
    };
  }) => {
    setIsLoading(true);
    setAuthError(null);

    const uid = currentUser?.uid || auth?.currentUser?.uid || `user_${Date.now()}`;

    const updatedProfile: UserBusinessProfile = {
      ...(currentUser || {}),
      uid,
      fullName: currentUser?.fullName || auth?.currentUser?.displayName || 'Business Owner',
      businessName: currentUser?.businessName || 'My Business',
      email: currentUser?.email || auth?.currentUser?.email || '',
      businessCategory: questionnaireData.businessCategory,
      country: questionnaireData.country,
      currency: questionnaireData.currency,
      currencySymbol:
        questionnaireData.currencySymbol ||
        (questionnaireData.currency === 'USD'
          ? '$'
          : questionnaireData.currency === 'GBP'
          ? '£'
          : questionnaireData.currency === 'EUR'
          ? '€'
          : '₦'),
      description: questionnaireData.description || '',
      onboardingAnswers: questionnaireData.onboardingAnswers,
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (questionnaireData.seedProduct) {
      db.addProduct({
        name: questionnaireData.seedProduct.name,
        category: updatedProfile.businessCategory || 'General',
        sellingPrice: questionnaireData.seedProduct.sellingPrice,
        costPrice: questionnaireData.seedProduct.costPrice,
        stock: questionnaireData.seedProduct.stock,
        minStockAlert: 3,
      });
    }

    applyUserProfile(updatedProfile);
    backgroundSaveFirestoreProfile(uid, updatedProfile);

    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setAuthError(null);
    setUnauthorizedDomain(null);

    if (!email || !email.trim()) {
      setIsLoading(false);
      setAuthError('Please enter your email address.');
      return { success: false, message: 'Please enter your email address.' };
    }

    if (!auth) {
      setIsLoading(false);
      setAuthError('Firebase backend is unavailable.');
      return { success: false, message: 'Firebase backend is unavailable.' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setIsLoading(false);
      return {
        success: true,
        message: 'Password reset link sent! Please check your email inbox.',
      };
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      setIsLoading(false);
      if (err.code === 'auth/user-not-found') {
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been dispatched.',
        };
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
        return { success: false, message: 'Please enter a valid email address.' };
      } else {
        return {
          success: true,
          message: 'Password reset link has been sent to your email.',
        };
      }
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setCurrentUser(null);
    currentUserRef.current = null;
    setPendingUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    db.unbindUser();
    setIsDashboardOpen(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        pendingUser,
        resetEmail,
        currentAuthMode,
        isDashboardOpen,
        isLoading,
        isAuthReady,
        authError,
        unauthorizedDomain,
        firebaseProjectId,
        openAuth,
        closeAuth,
        openDashboard,
        closeDashboard,
        setPendingUser,
        setResetEmail,
        setAuthError,
        clearDomainError,
        completeSignup,
        completeOnboarding,
        loginUser,
        signInWithGoogle,
        loginDemoUser,
        resetPassword,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
