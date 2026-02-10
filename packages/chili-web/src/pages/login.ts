// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { authService, type IApplication, type IRouter } from "chili-core";

export function renderLogin(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const page = document.createElement("div");
    page.className = "auth-minimal-page";
    page.innerHTML = `
        <div class="auth-minimal-container">
            <!-- Background Gradient Orbs -->
            <div class="auth-gradient-orb auth-gradient-orb-1"></div>
            <div class="auth-gradient-orb auth-gradient-orb-2"></div>
            <div class="auth-gradient-orb auth-gradient-orb-3"></div>

            <!-- Back Button -->
            <button id="back-home" class="auth-back-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Home
            </button>

            <!-- Glass Card -->
            <div class="auth-glass-card">
                <!-- Logo -->
                <div class="auth-logo">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                </div>

                <!-- Header -->
                <div class="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your Venus account</p>
                </div>

                <!-- Google Button -->
                <button type="button" id="google-login" class="auth-google-btn">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                <!-- Divider -->
                <div class="auth-divider">
                    <span>or</span>
                </div>

                <!-- Form -->
                <form id="login-form" class="auth-form">
                    <div class="auth-input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your.email@example.com"
                            required
                            class="auth-glass-input"
                        />
                    </div>

                    <div class="auth-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            required
                            class="auth-glass-input"
                        />
                    </div>

                    <button type="submit" class="auth-submit-btn">
                        Sign In
                    </button>
                </form>

                <!-- Footer Links -->
                <div class="auth-footer">
                    <p>
                        Don't have an account?
                        <button type="button" id="goto-signup" class="auth-link">Sign up</button>
                    </p>
                </div>
            </div>

            <!-- Terms -->
            <p class="auth-terms">
                By continuing, you agree to our
                <a href="#">Terms of Service</a>
                and
                <a href="#">Privacy Policy</a>
            </p>
        </div>
    `;

    container.appendChild(page);

    // Event handlers
    document.getElementById("back-home")?.addEventListener("click", () => {
        router.navigate("/");
    });

    document.getElementById("google-login")?.addEventListener("click", async () => {
        const btn = document.getElementById("google-login") as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Signing in...";
        }

        try {
            const user = await authService.signInWithGoogle();
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", user.displayName || "User");
            localStorage.setItem("userEmail", user.email || "");
            router.navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            alert("Failed to sign in with Google. Please try again.");
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                `;
            }
        }
    });

    document.getElementById("goto-signup")?.addEventListener("click", () => {
        router.navigate("/signup");
    });

    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
        const password = (form.querySelector('input[type="password"]') as HTMLInputElement).value;
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing in...";
        }

        try {
            // Sign in with email/password
            const user = await authService.signInWithEmail(email, password);

            // Email is verified - proceed with login
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", user.displayName || email.split("@")[0]);
            localStorage.setItem("userEmail", user.email || "");
            router.navigate("/dashboard");
        } catch (error: unknown) {
            console.error("Login failed:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to sign in. Please try again.";
            alert(errorMessage);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Sign In";
            }
        }
    });
}
