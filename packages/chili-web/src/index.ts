// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { AppBuilder } from "chili-builder";
import { authService, type IApplication, Logger } from "chili-core";
import { Loading } from "./loading";
import "./output.css";
import { setupRoutes } from "./routes";
import "./styles.css";

// Create app container
const appContainer = document.createElement("div");
appContainer.id = "app";
document.body.appendChild(appContainer);

const loading = new Loading();
appContainer.appendChild(loading);

// Store the original Chili3D UI elements
let chiliUIElements: HTMLElement[] = [];

async function handleApplicaionBuilt(app: IApplication) {
    appContainer.removeChild(loading);

    // Capture all Chili3D UI elements before routing starts
    chiliUIElements = Array.from(appContainer.children) as HTMLElement[];

    // Hide Chili3D UI initially (will be shown when navigating to /editor)
    chiliUIElements.forEach((el) => {
        el.style.display = "none";
    });

    // Setup and start router
    const router = setupRoutes(app);

    // Setup Firebase auth state listener
    authService.onAuthChange((user) => {
        if (user) {
            // User is signed in
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", user.displayName || "User");
            localStorage.setItem("userEmail", user.email || "");
            Logger.info(`User authenticated: ${user.email}`);
        } else {
            // User is signed out
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("username");
            localStorage.removeItem("userEmail");
            Logger.info("User signed out");

            // Redirect to home if on protected route
            const currentPath = window.location.pathname;
            if (currentPath === "/dashboard" || currentPath === "/editor") {
                router.navigate("/");
            }
        }
    });

    router.start();

    // Store router and UI elements on app for global access
    (app as any).router = router;
    (app as any).chiliUIElements = chiliUIElements;

    Logger.info("Application started with routing and Firebase auth enabled");
}

// prettier-ignore
new AppBuilder()
    .useIndexedDB()
    .useWasmOcc()
    .useThree()
    .useUI()
    .build()
    .then(handleApplicaionBuilt)
    .catch((err) => {
        alert(err.message);
    });
