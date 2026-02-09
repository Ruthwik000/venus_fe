// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

/// <reference types="./vite-env.d.ts" />

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    type User,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCR_OxYReDexDuyvTd-18bmXQ3hu6qeMJE",
    authDomain: "venus-ab3d3.firebaseapp.com",
    projectId: "venus-ab3d3",
    storageBucket: "venus-ab3d3.firebasestorage.app",
    messagingSenderId: "232838896301",
    appId: "1:232838896301:web:19e606fae22eb86d438424",
    measurementId: "G-Y7KDH49EB6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface AuthService {
    signInWithGoogle: () => Promise<User>;
    signOutUser: () => Promise<void>;
    getCurrentUser: () => User | null;
    onAuthChange: (callback: (user: User | null) => void) => () => void;
}

export const authService: AuthService = {
    async signInWithGoogle(): Promise<User> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    },

    async signOutUser(): Promise<void> {
        try {
            await signOut(auth);
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("username");
            localStorage.removeItem("userEmail");
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    },

    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    onAuthChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    },
};

export { analytics, auth };
