// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { type IApplication, Logger, type RouteMatch, Router } from "chili-core";
import { createLoader } from "chili-ui";
import { renderDashboard } from "./pages/dashboard";
import { renderEditor } from "./pages/editor";
import { renderLanding } from "./pages/landing";
import { renderLogin } from "./pages/login";
import { renderNotFound } from "./pages/not-found";
import { renderRequestAccess } from "./pages/request-access";
import { renderSignup } from "./pages/signup";
import { renderTestEmail } from "./pages/test-email";
import { renderVerifyEmail } from "./pages/verify-email";

interface AppWithUI extends IApplication {
    chiliUIElements?: HTMLElement[];
}

// Create a global loader instance
const globalLoader = createLoader();

export function setupRoutes(app: IApplication): Router {
    const router = new Router();

    // Landing page route
    router.addRoute("/", (_match: RouteMatch) => {
        Logger.info("Navigated to landing page");

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderLanding(app, router);
    });

    // Login route
    router.addRoute("/login", (_match: RouteMatch) => {
        Logger.info("Navigated to login page");

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderLogin(app, router);
    });

    // Signup route
    router.addRoute("/signup", (_match: RouteMatch) => {
        Logger.info("Navigated to signup page");

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderSignup(app, router);
    });

    // Email verification route
    router.addRoute("/verify-email", (_match: RouteMatch) => {
        Logger.info("Navigated to email verification page");

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderVerifyEmail(app, router);
    });

    // Test email route (for debugging)
    router.addRoute("/test-email", (_match: RouteMatch) => {
        Logger.info("Navigated to test email page");
        if (!isAuthenticated()) {
            Logger.warn("User not authenticated, redirecting to login");
            router.navigate("/login");
            return;
        }

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderTestEmail(app, router);
    });

    // Dashboard route (requires authentication)
    router.addRoute("/dashboard", async (_match: RouteMatch) => {
        globalLoader.show();
        Logger.info("Navigated to dashboard");
        if (!isAuthenticated()) {
            Logger.warn("User not authenticated, redirecting to login");
            globalLoader.hide();
            router.navigate("/login");
            return;
        }

        // Wait for Firebase auth to complete
        const { auth } = await import("chili-core");
        if (!auth.currentUser) {
            Logger.info("Waiting for Firebase auth to complete...");
            await new Promise<void>((resolve) => {
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    if (user) {
                        unsubscribe();
                        resolve();
                    }
                });
            });
        }

        // Cleanup real-time sync when leaving editor
        try {
            const { cleanupRealtimeSync } = require("./pages/editor");
            cleanupRealtimeSync();
        } catch {
            // Ignore if cleanup function doesn't exist
        }

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        renderDashboard(app, router);
        globalLoader.hide();
    });

    // Request access route
    router.addRoute("/request-access", async (_match: RouteMatch) => {
        Logger.info("Navigated to request access page");

        // Hide Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements) {
            for (const el of chiliUIElements) {
                el.style.display = "none";
            }
        }

        await renderRequestAccess(router);
    });

    // Editor route - show original Chili3D interface
    router.addRoute("/editor", async (_match: RouteMatch) => {
        globalLoader.show();
        Logger.info("Opening editor");

        // Wait for Firebase auth to initialize
        const { auth } = await import("chili-core");
        await new Promise<void>((resolve) => {
            if (auth.currentUser) {
                resolve();
            } else {
                const unsubscribe = auth.onAuthStateChanged(() => {
                    unsubscribe();
                    resolve();
                });
            }
        });

        if (!isAuthenticated() || !auth.currentUser) {
            Logger.warn("User not authenticated, redirecting to login");
            globalLoader.hide();
            // Get sessionId from URL to preserve it
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get("sessionId") || urlParams.get("session");
            if (sessionId) {
                router.navigate(`/login?redirect=${encodeURIComponent(`/editor?sessionId=${sessionId}`)}`);
            } else {
                router.navigate("/login");
            }
            return;
        }

        // Check if user has access to the project
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("sessionId") || urlParams.get("session");
        const ownerId = urlParams.get("owner");
        const projectName = urlParams.get("name");

        if (sessionId) {
            try {
                const { shareService, projectService } = await import("chili-core");
                const user = auth.currentUser;

                if (user) {
                    // Check if user owns the project
                    let hasAccess = false;
                    let isOwner = false;

                    try {
                        const project = await projectService.getProject(sessionId);
                        if (project) {
                            // User owns this project
                            hasAccess = true;
                            isOwner = true;
                            Logger.info("User is the project owner");
                        }
                    } catch {
                        Logger.info("Project not found in user's projects, checking shares...");
                    }

                    // If not owner, check if project is shared with user
                    if (!isOwner) {
                        const shares = await shareService.getSharedProjects();
                        hasAccess = shares.some((share) => share.projectId === sessionId);
                        if (hasAccess) {
                            Logger.info("User has shared access to project");
                        }
                    }

                    // If no access, redirect to request access page with all parameters
                    if (!hasAccess) {
                        Logger.warn("User does not have access to this project");
                        globalLoader.hide();
                        const params = [`sessionId=${sessionId}`];
                        if (ownerId) params.push(`owner=${ownerId}`);
                        if (projectName) params.push(`name=${projectName}`);
                        const redirectUrl = `/request-access?${params.join("&")}`;
                        router.navigate(redirectUrl);
                        return;
                    }
                }
            } catch (error) {
                Logger.error("Failed to check project access:", error);
            }
        }

        const container = document.getElementById("app") || document.body;

        // Remove any custom page content first
        const customElements = container.querySelectorAll(".modern-dashboard");
        for (const el of customElements) {
            el.remove();
        }

        // Reset container styling
        container.className = "";
        container.style.cssText = "";

        // Restore the original Chili3D UI elements (make them visible)
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements && chiliUIElements.length > 0) {
            Logger.info(`Restoring ${chiliUIElements.length} Chili UI elements`);
            for (const el of chiliUIElements) {
                el.style.display = "block"; // Force block display
                el.style.visibility = "visible"; // Ensure visibility
                el.style.opacity = "1"; // Ensure opacity
                // Ensure element is in the container
                if (!container.contains(el)) {
                    container.appendChild(el);
                    Logger.info("Appended Chili UI element to container");
                }
            }
        } else {
            Logger.warn("No Chili UI elements found to restore");
        }

        // Delegate to renderEditor which handles session ID + cloud loading
        await renderEditor(app, router);

        Logger.info("Editor initialized with Chili3D UI");
        globalLoader.hide();
    });

    // 404 catch-all route
    router.addRoute("*", (_match: RouteMatch) => {
        Logger.warn("Route not found");
        renderNotFound(app, router);
    });

    return router;
}

// Simple authentication check (you can replace this with real auth later)
function isAuthenticated(): boolean {
    return localStorage.getItem("isAuthenticated") === "true";
}
