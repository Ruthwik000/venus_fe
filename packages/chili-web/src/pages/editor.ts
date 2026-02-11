// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import type { IApplication, IRouter } from "chili-core";
import { Logger, projectService } from "chili-core";

export async function renderEditor(app: IApplication, _router: IRouter): Promise<void> {
    // Read session ID from URL first, then fall back to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get("sessionId");
    const sessionIdFromStorage = localStorage.getItem("currentSessionId");
    const sessionId = sessionIdFromUrl || sessionIdFromStorage;
    const projectName = localStorage.getItem("currentProjectName") || `Project-${Date.now()}`;

    if (sessionId) {
        localStorage.setItem("currentSessionId", sessionId);
        Logger.info(`Editor opened with session ID: ${sessionId}`);

        // If sessionId is not in URL, add it to maintain state across refreshes
        if (!sessionIdFromUrl && sessionId) {
            const newUrl = `${window.location.pathname}?sessionId=${sessionId}`;
            window.history.replaceState({}, "", newUrl);
            Logger.info(`Added sessionId to URL: ${sessionId}`);
        }
    }

    // Close ALL existing documents first to ensure clean state
    const existingDocs = Array.from(app.documents);
    for (const doc of existingDocs) {
        // Close without prompting - we're switching projects
        const views = app.views.filter((x) => x.document === doc);
        app.views.remove(...views);
        app.documents.delete(doc);
        doc.dispose();
        Logger.info(`Closed existing document: ${doc.name}`);
    }

    // Always try to load from Cloudinary first if we have a session ID
    let loadedFromCloud = false;

    if (sessionId) {
        try {
            Logger.info(`Fetching project data for sessionId: ${sessionId}`);
            const project = await projectService.getProject(sessionId);
            Logger.info(`Project data:`, project);

            if (project?.fileUrl) {
                Logger.info(`Loading project from Cloudinary: ${project.fileUrl}`);
                const response = await fetch(project.fileUrl);
                Logger.info(`Cloudinary fetch response status: ${response.status}`);

                if (response.ok) {
                    const json = await response.json();
                    Logger.info(`Loaded JSON from Cloudinary, document name: ${json.properties?.name}`);

                    // Override the document ID with sessionId to ensure unique storage per project
                    json.properties.id = sessionId;
                    await app.loadDocument(json);
                    loadedFromCloud = true;
                    Logger.info("Project loaded from cloud successfully");
                } else {
                    const errorText = await response.text();
                    Logger.warn(
                        `Failed to fetch project file: ${response.status} ${response.statusText}`,
                        errorText,
                    );
                }
            } else {
                Logger.info("No fileUrl found for project, creating new document");
            }
        } catch (error) {
            Logger.error("Failed to load project from cloud:", error);
            console.error("Load error details:", error);
        }
    }

    // Only create a new document if we didn't load from cloud
    if (!loadedFromCloud) {
        const docName = projectName;
        // Create document using the Document class directly with sessionId
        const { Document } = await import("chili");
        const doc = new Document(app, docName, sessionId);
        const { Material } = await import("chili-core");
        const lightGray = new Material(doc, "LightGray", 0xdedede);
        const deepGray = new Material(doc, "DeepGray", 0x898989);
        doc.modelManager.materials.push(lightGray, deepGray);

        // Create view for the document
        const { Plane } = await import("chili-core");
        const view = doc.visual.createView("3d", Plane.XY);
        app.activeView = view;

        Logger.info(`Created new document: ${docName} with ID: ${sessionId}`);
    }

    // Make sure we have an active view
    if (!app.activeView && app.views.items.length > 0) {
        app.activeView = app.views.items[0];
    }
}
