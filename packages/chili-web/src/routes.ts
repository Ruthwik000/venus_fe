// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { type IApplication, Logger, type RouteMatch, Router } from "chili-core";
import { renderDashboard } from "./pages/dashboard";
import { renderEditor } from "./pages/editor";
import { renderLanding } from "./pages/landing";
import { renderLogin } from "./pages/login";
import { renderSignup } from "./pages/signup";
import { renderTestEmail } from "./pages/test-email";
import { renderVerifyEmail } from "./pages/verify-email";

interface AppWithUI extends IApplication {
    chiliUIElements?: HTMLElement[];
}

export function setupRoutes(app: IApplication): Router {
    const router = new Router();
    const appWithUI = app as AppWithUI;

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
    router.addRoute("/dashboard", (_match: RouteMatch) => {
        Logger.info("Navigated to dashboard");
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

        renderDashboard(app, router);
    });

    // Editor route - show original Chili3D interface
    router.addRoute("/editor", async (_match: RouteMatch) => {
        Logger.info("Opening editor");
        if (!isAuthenticated()) {
            Logger.warn("User not authenticated, redirecting to login");
            router.navigate("/login");
            return;
        }

        const container = document.getElementById("app") || document.body;

        // Remove any custom page content first
        const customElements = container.querySelectorAll(".modern-dashboard");
        customElements.forEach((el) => el.remove());

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
    });

    // 404 catch-all route
    router.addRoute("*", (_match: RouteMatch) => {
        Logger.warn("Route not found");
        router.navigate("/");
    });

    return router;
}

// Simple authentication check (you can replace this with real auth later)
function isAuthenticated(): boolean {
    return localStorage.getItem("isAuthenticated") === "true";
}
