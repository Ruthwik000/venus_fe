// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { authService, type IApplication, type IRouter } from "chili-core";

export function renderVerifyEmail(_app: IApplication, router: IRouter): void {
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
                    <h1 id="verify-title">Verify Your Email</h1>
                    <p id="verify-message">Checking your email verification status...</p>
                </div>

                <!-- Loading Spinner -->
                <div id="loading-spinner" style="text-align: center; margin: 2rem 0;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>

                <!-- Action Buttons (hidden initially) -->
                <div id="action-buttons" style="display: none; margin-top: 2rem;">
                    <button id="resend-btn" class="auth-submit-btn" style="margin-bottom: 1rem;">
                        Resend Verification Email
                    </button>
                    <button id="goto-login-btn" class="auth-submit-btn">
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    `;

    container.appendChild(page);

    // Add spinner animation
    const style = document.createElement("style");
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Check verification status
    checkVerificationStatus(router);

    // Event handlers
    document.getElementById("resend-btn")?.addEventListener("click", async () => {
        const btn = document.getElementById("resend-btn") as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Sending...";
        }

        try {
            await authService.sendVerificationEmail();
            alert("Verification email sent! Please check your inbox.");
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Resend Verification Email";
            }
        } catch (error: any) {
            alert(error.message || "Failed to send verification email.");
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Resend Verification Email";
            }
        }
    });

    document.getElementById("goto-login-btn")?.addEventListener("click", () => {
        router.navigate("/login");
    });
}

async function checkVerificationStatus(router: IRouter): Promise<void> {
    const titleEl = document.getElementById("verify-title");
    const messageEl = document.getElementById("verify-message");
    const spinnerEl = document.getElementById("loading-spinner");
    const buttonsEl = document.getElementById("action-buttons");

    try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            // No token - check if user is already signed in
            const user = authService.getCurrentUser();

            if (!user) {
                if (titleEl) titleEl.textContent = "Not Signed In";
                if (messageEl) messageEl.textContent = "Please sign in to verify your email.";
                if (spinnerEl) spinnerEl.style.display = "none";
                if (buttonsEl) {
                    buttonsEl.style.display = "block";
                    const resendBtn = document.getElementById("resend-btn");
                    if (resendBtn) resendBtn.style.display = "none";
                }
                return;
            }

            // User is signed in, check verification status
            await user.reload();

            if (user.emailVerified) {
                if (titleEl) titleEl.textContent = "Email Verified! ✓";
                if (messageEl)
                    messageEl.textContent = "Your email has been successfully verified. You can now sign in.";
                if (spinnerEl) spinnerEl.style.display = "none";
                if (buttonsEl) {
                    buttonsEl.style.display = "block";
                    const resendBtn = document.getElementById("resend-btn");
                    if (resendBtn) resendBtn.style.display = "none";
                }

                // Auto-redirect to login after 3 seconds
                setTimeout(() => {
                    router.navigate("/login");
                }, 3000);
            } else {
                if (titleEl) titleEl.textContent = "Email Not Verified";
                if (messageEl) {
                    messageEl.textContent =
                        "Please check your inbox and click the verification link. If you didn't receive it, you can resend it below.";
                }
                if (spinnerEl) spinnerEl.style.display = "none";
                if (buttonsEl) buttonsEl.style.display = "block";
            }
            return;
        }

        // Token exists - verify it and create account
        if (titleEl) titleEl.textContent = "Verifying Your Email...";
        if (messageEl) messageEl.textContent = "Please wait while we verify your email address.";

        const user = await authService.verifyEmailAndCreateAccount(token);

        if (titleEl) titleEl.textContent = "Email Verified! ✓";
        if (messageEl)
            messageEl.textContent =
                "Your email has been successfully verified and your account has been created! Redirecting to login...";
        if (spinnerEl) spinnerEl.style.display = "none";
        if (buttonsEl) {
            buttonsEl.style.display = "block";
            const resendBtn = document.getElementById("resend-btn");
            if (resendBtn) resendBtn.style.display = "none";
        }

        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
            router.navigate("/login");
        }, 2000);
    } catch (error: any) {
        console.error("Error verifying email:", error);
        if (titleEl) titleEl.textContent = "Verification Failed";
        if (messageEl) messageEl.textContent = error.message || "Failed to verify email. Please try again.";
        if (spinnerEl) spinnerEl.style.display = "none";
        if (buttonsEl) {
            buttonsEl.style.display = "block";
            const resendBtn = document.getElementById("resend-btn");
            if (resendBtn) resendBtn.style.display = "none";
        }
    }
}
