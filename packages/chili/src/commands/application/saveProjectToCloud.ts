// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import {
    cloudinaryService,
    command,
    I18n,
    type IApplication,
    type ICommand,
    Logger,
    PubSub,
    projectService,
} from "chili-core";

@command({
    key: "doc.saveToCloud",
    icon: "icon-cloud-upload",
})
export class SaveProjectToCloud implements ICommand {
    async execute(app: IApplication): Promise<void> {
        const document = app.activeView?.document;
        if (!document) return;

        // Get the current session ID from localStorage (set when project was created/opened)
        const sessionId = localStorage.getItem("currentSessionId");
        if (!sessionId) {
            PubSub.default.pub("showToast", "toast.noProjectSession");
            Logger.warn("No session ID found. Save the project from the dashboard first.");
            return;
        }

        PubSub.default.pub(
            "showPermanent",
            async () => {
                try {
                    // 1. Serialize the document to JSON (same as .cd file content)
                    const serialized = document.serialize();
                    const fileContent = JSON.stringify(serialized);

                    // 2. Upload to Cloudinary (overwrites previous version)
                    PubSub.default.pub("showToast", "toast.uploading");
                    const uploadResult = await cloudinaryService.uploadProjectFile(
                        fileContent,
                        document.name,
                        sessionId,
                    );

                    Logger.info(`Project uploaded to Cloudinary: ${uploadResult.secure_url}`);

                    // 3. Update Firestore with the new Cloudinary URL and timestamp
                    await projectService.updateProjectFile(sessionId, uploadResult.secure_url);

                    // 4. Also update the project name in case it changed
                    await projectService.updateProjectName(sessionId, document.name);

                    // 5. Also save locally (IndexedDB) as before
                    await document.save();

                    PubSub.default.pub("showToast", "toast.projectSavedToCloud");
                    Logger.info("Project saved to cloud successfully");
                } catch (error) {
                    Logger.error("Failed to save project to cloud:", error);
                    PubSub.default.pub("showToast", "toast.cloudSaveFailed");
                    throw error;
                }
            },
            "toast.excuting{0}",
            I18n.translate("command.doc.saveToCloud"),
        );
    }
}
