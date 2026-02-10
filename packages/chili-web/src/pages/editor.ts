// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";
import { Logger, projectService } from "chili-core";

export async function renderEditor(app: IApplication, _router: IRouter): Promise<void> {
    const container = document.getElementById("app") || document.body;

    // Remove only our custom page elements, keeping the Chili3D UI intact
    const customElements = container.querySelectorAll(
        ".dashboard-page, .landing-page-hero, .min-h-screen, .auth-page-classic",
    );
    customElements.forEach((el) => {
        el.remove();
    });

    // Reset container to default state
    container.className = "";
    container.style.cssText = "";

    // Read session ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("sessionId") || localStorage.getItem("currentSessionId");
    const projectName = localStorage.getItem("currentProjectName") || `Project-${Date.now()}`;

    if (sessionId) {
        localStorage.setItem("currentSessionId", sessionId);
        Logger.info(`Editor opened with session ID: ${sessionId}`);
    }

    // The Chili3D UI should already be in the container from the initial app build
    // We just need to create a new document if one doesn't exist
    if (app.documents.size === 0) {
        // Check if there's a saved .cd file in Cloudinary to load
        let loadedFromCloud = false;

        if (sessionId) {
            try {
                const project = await projectService.getProject(sessionId);
                if (project?.fileUrl) {
                    Logger.info(`Loading project from Cloudinary: ${project.fileUrl}`);
                    const response = await fetch(project.fileUrl);
                    if (response.ok) {
                        const json = await response.json();
                        await app.loadDocument(json);
                        loadedFromCloud = true;
                        Logger.info("Project loaded from cloud successfully");
                    }
                }
            } catch (error) {
                Logger.warn("Failed to load project from cloud, creating new document:", error);
            }
        }

        if (!loadedFromCloud) {
            const docName = projectName;
            await app.newDocument(docName);
        }
    }

    // Make sure we have an active view
    if (!app.activeView && app.views.items.length > 0) {
        app.activeView = app.views.items[0];
    }
}
