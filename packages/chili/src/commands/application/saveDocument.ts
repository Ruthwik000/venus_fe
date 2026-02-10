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
    key: "doc.save",
    icon: "icon-save",
    isApplicationCommand: true,
})
export class SaveDocument implements ICommand {
    async execute(app: IApplication): Promise<void> {
        const document = app.activeView?.document;
        if (!document) return;
        PubSub.default.pub(
            "showPermanent",
            async () => {
                // 1. Save locally (IndexedDB) as before
                await document.save();

                // 2. Upload to Cloudinary & update Firestore if a project session is active
                const sessionId = localStorage.getItem("currentSessionId");
                if (sessionId) {
                    try {
                        const serialized = document.serialize();
                        const fileContent = JSON.stringify(serialized);

                        // Upload .cd file to Cloudinary
                        const uploadResult = await cloudinaryService.uploadProjectFile(
                            fileContent,
                            document.name,
                            sessionId,
                        );
                        Logger.info(`Uploaded to Cloudinary: ${uploadResult.secure_url}`);

                        // Update Firestore with the Cloudinary URL
                        await projectService.updateProjectFile(sessionId, uploadResult.secure_url);
                        await projectService.updateProjectName(sessionId, document.name);

                        Logger.info("Project saved to cloud successfully");
                    } catch (error) {
                        Logger.error("Cloud save failed (local save succeeded):", error);
                        console.error("Cloud save error:", error);
                    }
                }

                PubSub.default.pub("showToast", "toast.document.saved");
            },
            "toast.excuting{0}",
            I18n.translate("command.doc.save"),
        );
    }
}
