// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication } from "chili-core";
import type { IRouter } from "chili-core/src/router";

export async function renderEditor(app: IApplication, router: IRouter): Promise<void> {
    const container = document.getElementById("app") || document.body;

    // Remove only our custom page elements, keeping the Chili3D UI intact
    const customElements = container.querySelectorAll(
        ".dashboard-page, .landing-page-hero, .min-h-screen, .auth-page-classic",
    );
    customElements.forEach((el) => el.remove());

    // Reset container to default state
    container.className = "";
    container.style.cssText = "";

    // The Chili3D UI should already be in the container from the initial app build
    // We just need to create a new document if one doesn't exist
    if (app.documents.size === 0) {
        const docName = `Project-${Date.now()}`;
        await app.newDocument(docName);
    }

    // Make sure we have an active view
    if (!app.activeView && app.views.items.length > 0) {
        app.activeView = app.views.items[0];
    }
}
