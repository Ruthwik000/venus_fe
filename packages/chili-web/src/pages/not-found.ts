// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";

export function renderNotFound(_app: IApplication, router: IRouter): void {
    const container = document.getElementById("app") || document.body;
    container.innerHTML = "";
    container.className = "";
    container.style.cssText = "";

    const page = document.createElement("div");
    page.className = "not-found-page";
    page.innerHTML = `
        <div class="not-found-container">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            
            <div class="not-found-content">
                <h1 class="not-found-title">404</h1>
                <p class="not-found-description">
                    The page you're looking for might have been<br />
                    moved or doesn't exist.
                </p>
                <button class="not-found-button" id="go-dashboard">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go to Dashboard
                </button>
            </div>
        </div>
    `;

    container.appendChild(page);

    // Add event listener for dashboard button
    const dashboardBtn = document.getElementById("go-dashboard");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
            router.navigate("/dashboard");
        });
    }
}
