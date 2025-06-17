import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from './firebaseConfig'; // 🔁 your firebase config

// ✅ Initialize Firebase App (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Set up Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Set up Realtime Database
const database = getDatabase(app);

// ✅ Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '83981288140-b0nfip0e5un8ih2f2g2vo7nlaemd2bh9.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export const SignInWithGoogle = async () => {
  try {
    // ✅ Ensure Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // ✅ Begin Sign-In
    const userInfo = await GoogleSignin.signIn();

    if (
      !userInfo ||
      typeof userInfo !== 'object' ||
      !userInfo.data ||
      !userInfo.data.user
    ) {
      throw new Error('Google sign-in returned invalid user info');
    }

    const { idToken, user } = userInfo.data;

    if (!idToken) {
      throw new Error('Missing idToken from Google sign-in');
    }

    if (!user || !user.email) {
      throw new Error('Missing user email in Google sign-in');
    }

    const email = user.email.toLowerCase();

    // ✅ Firebase Credential
    const credential = GoogleAuthProvider.credential(idToken);

    // ✅ Check DB for email access
    const emailKey = email.replace(/\./g, ',');
    const emailRef = ref(database, `/emails/${emailKey}`);
    const snapshot = await get(emailRef);

    if (!snapshot.exists()) {
      Alert.alert('Access Denied', 'Sorry, your email is not registered with us.');
      return false;
    }

    // ✅ Sign in to Firebase
    await signInWithCredential(auth, credential);

    // ✅ Optional cleanup
    await GoogleSignin.revokeAccess();

    return true;
  } catch (error) {
    console.error('❌ Sign-in error:', error.message, error);
    Alert.alert('Sign-In Failed', error.message || 'An unexpected error occurred.');
    return false;
  }
};
