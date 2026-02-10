// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { type IApplication, Logger, type RouteMatch, Router } from "chili-core";
import { renderDashboard } from "./pages/dashboard";
import { renderLanding } from "./pages/landing";
import { renderLogin } from "./pages/login";
import { renderSignup } from "./pages/signup";
import { renderTestEmail } from "./pages/test-email";
import { renderVerifyEmail } from "./pages/verify-email";

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

        // Clear any custom page content
        container.innerHTML = "";
        container.className = "";
        container.style.cssText = "";

        // Restore the original Chili3D UI elements
        const chiliUIElements = (app as unknown as { chiliUIElements?: HTMLElement[] }).chiliUIElements;
        if (chiliUIElements && chiliUIElements.length > 0) {
            for (const el of chiliUIElements) {
                el.style.display = "";
                container.appendChild(el);
            }
        }

        // Create a new document if needed
        if (app.documents.size === 0) {
            await app.newDocument(`Project-${Date.now()}`);
        }

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
