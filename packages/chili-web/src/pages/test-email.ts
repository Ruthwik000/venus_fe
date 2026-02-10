// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { authService, type IApplication, type IRouter } from "chili-core";

export function renderTestEmail(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const page = document.createElement("div");
    page.className = "auth-minimal-page";
    page.innerHTML = `
        <div class="auth-minimal-container">
            <div class="auth-glass-card">
                <div class="auth-header">
                    <h1>Email Verification Test</h1>
                    <p>Test email verification functionality</p>
                </div>

                <div style="margin: 2rem 0; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <h3 style="margin-bottom: 1rem;">Current User Status</h3>
                    <div id="user-status" style="font-family: monospace; font-size: 0.9rem;"></div>
                </div>

                <button id="send-verification" class="auth-submit-btn" style="margin-bottom: 1rem;">
                    Send Verification Email
                </button>

                <button id="check-status" class="auth-submit-btn" style="margin-bottom: 1rem;">
                    Check Verification Status
                </button>

                <button id="back-btn" class="auth-submit-btn">
                    Back to Dashboard
                </button>

                <div id="console-output" style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; font-family: monospace; font-size: 0.85rem; max-height: 300px; overflow-y: auto;">
                    <div style="color: #4ade80; margin-bottom: 0.5rem;">Console Output:</div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(page);

    const consoleOutput = document.getElementById("console-output");
    const userStatus = document.getElementById("user-status");

    function log(message: string, type: "info" | "success" | "error" = "info"): void {
        const colors = {
            info: "#60a5fa",
            success: "#4ade80",
            error: "#f87171",
        };
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement("div");
        logEntry.style.color = colors[type];
        logEntry.style.marginBottom = "0.25rem";
        logEntry.textContent = `[${timestamp}] ${message}`;
        consoleOutput?.appendChild(logEntry);
        if (consoleOutput) {
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
    }

    function updateUserStatus(): void {
        const user = authService.getCurrentUser();
        if (!user) {
            if (userStatus) {
                userStatus.innerHTML = `
                    <div style="color: #f87171;">❌ No user signed in</div>
                `;
            }
            return;
        }

        if (userStatus) {
            userStatus.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>Email:</strong> ${user.email || "N/A"}
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <strong>Email Verified:</strong> 
                    <span style="color: ${user.emailVerified ? "#4ade80" : "#f87171"};">
                        ${user.emailVerified ? "✓ Yes" : "✗ No"}
                    </span>
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <strong>User ID:</strong> ${user.uid}
                </div>
                <div>
                    <strong>Created:</strong> ${user.metadata.creationTime || "N/A"}
                </div>
            `;
        }
    }

    // Initial status
    updateUserStatus();
    log("Test page loaded", "info");

    // Send verification email
    document.getElementById("send-verification")?.addEventListener("click", async () => {
        const btn = document.getElementById("send-verification") as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Sending...";
        }

        try {
            log("Attempting to send verification email...", "info");
            await authService.sendVerificationEmail();
            log("✓ Verification email sent successfully!", "success");
            alert("Verification email sent! Check your inbox and spam folder.");
        } catch (error: unknown) {
            log(`✗ Error: ${error instanceof Error ? error.message : String(error)}`, "error");
            log(
                `Error code: ${error instanceof Error && "code" in error ? (error as { code?: string }).code || "N/A" : "N/A"}`,
                "error",
            );
            alert(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Send Verification Email";
            }
        }
    });

    // Check verification status
    document.getElementById("check-status")?.addEventListener("click", async () => {
        const btn = document.getElementById("check-status") as HTMLButtonElement;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Checking...";
        }

        try {
            log("Checking verification status...", "info");
            const isVerified = await authService.checkEmailVerified();
            log(
                `Verification status: ${isVerified ? "VERIFIED ✓" : "NOT VERIFIED ✗"}`,
                isVerified ? "success" : "error",
            );
            updateUserStatus();
        } catch (error: unknown) {
            log(
                `✗ Error checking status: ${error instanceof Error ? error.message : String(error)}`,
                "error",
            );
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Check Verification Status";
            }
        }
    });

    // Back button
    document.getElementById("back-btn")?.addEventListener("click", () => {
        router.navigate("/dashboard");
    });
}
