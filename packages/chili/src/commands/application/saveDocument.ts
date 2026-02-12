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
    projectHistoryService,
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
        if (!document) {
            Logger.warn("No active document to save");
            return;
        }

        const sessionId = localStorage.getItem("currentSessionId");
        const ownerId = localStorage.getItem("currentProjectOwnerId");

        Logger.info(
            `Save command triggered. SessionId: ${sessionId}, OwnerId: ${ownerId}, Document: ${document.name}`,
        );

        // Debug: Log localStorage contents
        console.log("=== SAVE DEBUG ===");
        console.log("sessionId:", sessionId);
        console.log("ownerId:", ownerId);
        console.log("document.name:", document.name);
        console.log("==================");

        PubSub.default.pub(
            "showPermanent",
            async () => {
                try {
                    // 1. Save locally (IndexedDB) as before
                    await document.save();
                    Logger.info("✓ Document saved to IndexedDB");

                    // 2. Upload to Cloudinary & update Firestore if a project session is active
                    if (sessionId && ownerId) {
                        try {
                            Logger.info("Starting Cloudinary upload...");

                            const serialized = document.serialize();
                            const fileContent = JSON.stringify(serialized);
                            Logger.info(`Serialized document size: ${fileContent.length} bytes`);

                            // Upload .cd file to Cloudinary
                            const uploadResult = await cloudinaryService.uploadProjectFile(
                                fileContent,
                                document.name,
                                sessionId,
                            );
                            Logger.info(`✓ Uploaded to Cloudinary: ${uploadResult.secure_url}`);

                            // Update Firestore with the Cloudinary URL (using owner's path)
                            await projectService.updateProjectFileByOwner(
                                sessionId,
                                ownerId,
                                uploadResult.secure_url,
                            );
                            await projectService.updateProjectNameByOwner(sessionId, ownerId, document.name);
                            Logger.info("✓ Updated Firestore");

                            // Add to project history
                            console.log("=== ADDING TO HISTORY ===");
                            console.log("sessionId:", sessionId);
                            console.log("ownerId:", ownerId);
                            console.log("document.name:", document.name);
                            console.log("uploadResult.secure_url:", uploadResult.secure_url);
                            console.log("Path: users/" + ownerId + "/projects/" + sessionId + "/history");

                            await projectHistoryService.addChange(
                                sessionId,
                                ownerId,
                                "modified",
                                `Updated project: ${document.name}`,
                                uploadResult.secure_url,
                            );
                            console.log("✓ Added to project history successfully");
                            Logger.info("✓ Added to project history");

                            Logger.info("✓✓✓ Project saved to cloud successfully ✓✓✓");
                        } catch (error) {
                            Logger.error("✗ Cloud save failed (local save succeeded):", error);
                            console.error("Cloud save error details:", error);
                        }
                    } else {
                        Logger.warn("⚠ No sessionId or ownerId found - skipping cloud save");
                        console.warn("Missing:", { sessionId, ownerId });
                    }

                    PubSub.default.pub("showToast", "toast.document.saved");
                } catch (error) {
                    Logger.error("✗ Save failed:", error);
                    console.error("Save error:", error);
                }
            },
            "toast.excuting{0}",
            I18n.translate("command.doc.save"),
        );
    }
}
