// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

/// <reference types="./vite-env.d.ts" />

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    type User,
} from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    getFirestore,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

interface PendingRegistration {
    email: string;
    password: string;
    verificationToken: string;
    createdAt: any;
    expiresAt: any;
}

export interface AuthService {
    signInWithGoogle: () => Promise<User>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    verifyEmailAndCreateAccount: (token: string) => Promise<User>;
    signInWithEmail: (email: string, password: string) => Promise<User>;
    sendVerificationEmail: (user?: User) => Promise<void>;
    checkEmailVerified: () => Promise<boolean>;
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

    async signUpWithEmail(email: string, password: string): Promise<void> {
        try {
            console.log("Creating pending registration for:", email);

            // Check if email already exists in Auth
            const existingUsers = await getDocs(query(collection(db, "users"), where("email", "==", email)));
            if (!existingUsers.empty) {
                throw new Error("This email is already registered. Please sign in instead.");
            }

            // Generate verification token
            const verificationToken = crypto.randomUUID();

            // Store pending registration in Firestore
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

            await addDoc(collection(db, "pendingRegistrations"), {
                email,
                password, // In production, you should hash this!
                verificationToken,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt.getTime(),
            });

            // Send verification email using EmailJS
            const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
            const emailJSServiceId = "service_4ibzwrh";
            const emailJSTemplateId = "template_qp9d4fq";
            const emailJSPublicKey = "FqLFbPk7ZMn1JSqWo";

            // Send email using EmailJS API
            const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: emailJSServiceId,
                    template_id: emailJSTemplateId,
                    user_id: emailJSPublicKey,
                    template_params: {
                        to_email: email,
                        to_name: email.split("@")[0],
                        verification_url: verificationUrl,
                        app_name: "Venus",
                        current_year: new Date().getFullYear().toString(),
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("EmailJS API error:", errorData);
                throw new Error(
                    `Failed to send verification email: ${errorData.message || response.statusText}`,
                );
            }

            console.log("Verification email sent successfully via EmailJS");
        } catch (error: any) {
            console.error("Error creating pending registration:", error);
            throw error;
        }
    },

    async verifyEmailAndCreateAccount(token: string): Promise<User> {
        try {
            console.log("Verifying token and creating account:", token);

            // Find pending registration
            const pendingRegs = await getDocs(
                query(collection(db, "pendingRegistrations"), where("verificationToken", "==", token)),
            );

            if (pendingRegs.empty) {
                throw new Error("Invalid or expired verification link.");
            }

            const pendingReg = pendingRegs.docs[0];
            const data = pendingReg.data() as PendingRegistration;

            // Check if expired
            if (data.expiresAt < Date.now()) {
                await deleteDoc(pendingReg.ref);
                throw new Error("Verification link has expired. Please sign up again.");
            }

            // Create Firebase Auth account
            console.log("Creating Firebase Auth account for:", data.email);
            const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

            // Delete pending registration
            await deleteDoc(pendingReg.ref);

            console.log("Account created successfully!");
            return result.user;
        } catch (error: any) {
            console.error("Error verifying email and creating account:", error);
            throw error;
        }
    },

    async signInWithEmail(email: string, password: string): Promise<User> {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error: any) {
            console.error("Error signing in with email:", error);

            // Provide user-friendly error messages
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                throw new Error("Invalid email or password. Please try again.");
            } else if (error.code === "auth/user-not-found") {
                throw new Error(
                    "No account found with this email. Please check your email for the verification link.",
                );
            } else if (error.code === "auth/invalid-email") {
                throw new Error("Invalid email format. Please check your email address.");
            }

            throw error;
        }
    },

    async sendVerificationEmail(user?: User): Promise<void> {
        try {
            const currentUser = user || auth.currentUser;

            if (!currentUser) {
                throw new Error("No user is currently signed in.");
            }

            // Check if email is already verified
            if (currentUser.emailVerified) {
                throw new Error("Email is already verified.");
            }

            // Configure action code settings for the verification email
            const actionCodeSettings = {
                url: `${window.location.origin}/verify-email`,
                handleCodeInApp: false,
            };

            await sendEmailVerification(currentUser, actionCodeSettings);
            console.log("Verification email sent successfully to:", currentUser.email);
        } catch (error: any) {
            console.error("Error sending verification email:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            throw error;
        }
    },

    async checkEmailVerified(): Promise<boolean> {
        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                return false;
            }

            // Reload user data to get the latest verification status
            await currentUser.reload();

            return currentUser.emailVerified;
        } catch (error) {
            console.error("Error checking email verification:", error);
            return false;
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
export type { User };
