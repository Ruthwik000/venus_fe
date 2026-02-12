// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { authService, type IApplication, type IRouter } from "chili-core";

export function renderSignup(_app: IApplication, router: IRouter): void {
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
                    <img src="/favicon.svg" alt="Venus" style="width: 48px; height: 48px; filter: brightness(0) invert(1);" />
                </div>

                <!-- Header -->
                <div class="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Venus and start designing</p>
                </div>

                <!-- Google Button -->
                <button type="button" id="google-signup" class="auth-google-btn">
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
                <form id="signup-form" class="auth-form">
                    <div class="auth-input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Choose a username"
                            required
                            class="auth-glass-input"
                        />
                    </div>

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
                            placeholder="Create a strong password"
                            required
                            class="auth-glass-input"
                        />
                    </div>

                    <button type="submit" class="auth-submit-btn">
                        Create Account
                    </button>
                </form>

                <!-- Footer Links -->
                <div class="auth-footer">
                    <p>
                        Already have an account?
                        <button type="button" id="goto-login" class="auth-link">Sign in</button>
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

    document.getElementById("google-signup")?.addEventListener("click", async () => {
        const btn = document.getElementById("google-signup") as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Signing up...";
        }

        try {
            const user = await authService.signInWithGoogle();
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", user.displayName || "User");
            localStorage.setItem("userEmail", user.email || "");
            router.navigate("/dashboard");
        } catch (error) {
            console.error("Signup failed:", error);
            alert("Failed to sign up with Google. Please try again.");
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

    document.getElementById("goto-login")?.addEventListener("click", () => {
        router.navigate("/login");
    });

    document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.querySelector('input[type="text"]') as HTMLInputElement).value;
        const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
        const password = (form.querySelector('input[type="password"]') as HTMLInputElement).value;
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating account...";
        }

        try {
            // Create user with email/password and send verification email
            await authService.signUpWithEmail(email, password);

            // Store username and email for later use
            localStorage.setItem("pendingUsername", username);
            localStorage.setItem("userEmail", email);

            // Show success message
            alert(
                `Account registration initiated! 📧\n\n` +
                    `A verification email has been sent to:\n${email}\n\n` +
                    `Please check your inbox and click the verification link to complete your registration.\n\n` +
                    `Note: The email may take a few minutes to arrive. Check your spam folder if you don't see it.`,
            );

            // Redirect to email verification page
            router.navigate("/verify-email");
        } catch (error: unknown) {
            console.error("Signup failed:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to create account. Please try again.";
            alert(errorMessage);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Create Account";
            }
        }
    });
}
