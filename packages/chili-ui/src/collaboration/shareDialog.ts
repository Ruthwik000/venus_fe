// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div, input, label, select } from "chili-controls";
import { type PermissionLevel, type ProjectShare, shareService } from "chili-core";
import style from "./shareDialog.module.css";

export class ShareDialog extends HTMLElement {
    private emailInput: HTMLInputElement;
    private permissionSelect: HTMLSelectElement;
    private sharesList: HTMLDivElement;
    private linkInput: HTMLInputElement;

    constructor(
        private projectId: string,
        private projectName: string,
        private ownerId?: string,
    ) {
        super();
        this.className = style.dialog;

        this.emailInput = input({
            className: style.input,
            type: "email",
            placeholder: "Enter email address",
        }) as HTMLInputElement;

        // All collaborators get editor permissions (can edit and save)
        this.permissionSelect = select(
            { className: style.select, style: "display: none;" },
            this.createOption("editor", "Can edit"),
        ) as HTMLSelectElement;

        this.linkInput = input({
            className: style.linkInput,
            type: "text",
            readOnly: true,
            value: this.getShareLink(),
        }) as HTMLInputElement;

        this.sharesList = div({ className: style.sharesList });

        this.render();
        this.loadShares();
    }

    private createOption(value: string, text: string) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        return option;
    }

    private getShareLink(): string {
        const baseUrl = `${window.location.origin}/editor?sessionId=${this.projectId}`;
        const params = [];

        if (this.ownerId) {
            params.push(`owner=${this.ownerId}`);
        }

        // Add project name to URL for display on request access page
        if (this.projectName) {
            params.push(`name=${encodeURIComponent(this.projectName)}`);
        }

        return params.length > 0 ? `${baseUrl}&${params.join("&")}` : baseUrl;
    }

    private render() {
        const header = div(
            { className: style.header },
            div({ className: style.title, textContent: `Share "${this.projectName}"` }),
            button({
                className: style.closeButton,
                textContent: "×",
                onclick: () => this.close(),
            }),
        );

        const linkSection = div(
            { className: style.section },
            label({ className: style.label, textContent: "Share Link" }),
            div(
                { className: style.linkContainer },
                this.linkInput,
                button({
                    className: style.copyButton,
                    textContent: "Copy",
                    onclick: () => this.copyLink(),
                }),
            ),
            div({
                className: style.hint,
                textContent: "Anyone with the link can request access",
            }),
        );

        const addPeopleSection = div(
            { className: style.section },
            label({ className: style.label, textContent: "Add Collaborator" }),
            div(
                { className: style.addPeopleContainer },
                this.emailInput,
                button({
                    className: style.addButton,
                    textContent: "Add",
                    onclick: () => this.handleShare(),
                }),
            ),
            div({
                className: style.hint,
                textContent: "Collaborators can view, edit, and save the project",
            }),
        );

        const sharesSection = div(
            { className: style.section },
            label({ className: style.label, textContent: "Collaborators" }),
            this.sharesList,
        );

        this.append(header, linkSection, addPeopleSection, sharesSection);
    }

    private async copyLink() {
        try {
            await navigator.clipboard.writeText(this.linkInput.value);
            this.showToast("Link copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy link:", error);
            this.showToast("Failed to copy link", true);
        }
    }

    private async handleShare() {
        const email = this.emailInput.value.trim();
        const permission = this.permissionSelect.value as PermissionLevel;

        if (!email) {
            this.showToast("Please enter an email address", true);
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast("Please enter a valid email address", true);
            return;
        }

        try {
            await shareService.shareProject(this.projectId, email, permission);
            this.emailInput.value = "";
            this.showToast(`Shared with ${email}`);
            this.loadShares();
        } catch (error) {
            console.error("Failed to share project:", error);
            this.showToast("Failed to share project", true);
        }
    }

    private async loadShares() {
        try {
            const shares = await shareService.getProjectShares(this.projectId);
            this.renderShares(shares);
        } catch (error) {
            console.error("Failed to load shares:", error);
        }
    }

    private renderShares(shares: ProjectShare[]) {
        this.sharesList.innerHTML = "";

        if (shares.length === 0) {
            this.sharesList.append(
                div({
                    className: style.emptyState,
                    textContent: "No collaborators yet",
                }),
            );
            return;
        }

        shares.forEach((share) => {
            const shareItem = div(
                { className: style.shareItem },
                div(
                    { className: style.shareInfo },
                    div({ className: style.shareEmail, textContent: share.sharedWith }),
                    div({
                        className: style.sharePermission,
                        textContent: "Collaborator",
                    }),
                ),
                div(
                    { className: style.shareActions },
                    button({
                        className: style.removeButton,
                        textContent: "Remove",
                        onclick: () => this.handleRemove(share.sharedWith),
                    }),
                ),
            );
            this.sharesList.append(shareItem);
        });
    }

    private async handleRemove(email: string) {
        if (!confirm(`Remove access for ${email}?`)) return;

        try {
            await shareService.revokeAccess(this.projectId, email);
            this.showToast("Access removed");
            this.loadShares();
        } catch (error) {
            console.error("Failed to remove access:", error);
            this.showToast("Failed to remove access", true);
        }
    }

    private getPermissionLabel(permission: PermissionLevel): string {
        const labels: Record<PermissionLevel, string> = {
            viewer: "Can view",
            commenter: "Can comment",
            editor: "Can edit",
            admin: "Admin",
            owner: "Owner",
        };
        return labels[permission];
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private showToast(message: string, isError = false) {
        const toast = div({
            className: `${style.toast} ${isError ? style.toastError : ""}`,
            textContent: message,
        });
        document.body.append(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    private close() {
        this.remove();
    }
}

customElements.define("share-dialog", ShareDialog);
