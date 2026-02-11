// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { div } from "chili-controls";
import { presenceService, type UserPresence } from "chili-core";
import type { Unsubscribe } from "firebase/firestore";
import style from "./presenceIndicators.module.css";

export class PresenceIndicators extends HTMLElement {
    private unsubscribe?: Unsubscribe;
    private users: UserPresence[] = [];
    private userColors: Map<string, string> = new Map();
    private colorPalette = [
        "#2d2d2d",
        "#3a3a3a",
        "#4a4a4a",
        "#5a5a5a",
        "#6a6a6a",
        "#7a7a7a",
        "#8a8a8a",
        "#9a9a9a",
    ];

    constructor(private projectId: string) {
        super();
        this.className = style.container;
        this.startPresenceTracking();
    }

    private startPresenceTracking() {
        // Subscribe to presence updates
        this.unsubscribe = presenceService.subscribeToPresence(this.projectId, (users) => {
            this.users = users;
            this.render();
        });

        // Update own presence every 5 seconds
        this.updateOwnPresence();
        setInterval(() => this.updateOwnPresence(), 5000);

        // Set inactive on page unload
        window.addEventListener("beforeunload", () => {
            presenceService.setInactive(this.projectId);
        });
    }

    private async updateOwnPresence() {
        try {
            await presenceService.updatePresence(this.projectId);
        } catch (error) {
            console.error("Failed to update presence:", error);
        }
    }

    private getUserColor(uid: string): string {
        if (!this.userColors.has(uid)) {
            const colorIndex = this.userColors.size % this.colorPalette.length;
            this.userColors.set(uid, this.colorPalette[colorIndex]);
        }
        return this.userColors.get(uid)!;
    }

    private getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    private render() {
        this.innerHTML = "";

        if (this.users.length === 0) {
            return;
        }

        const userElements = this.users.map((user) => {
            const color = this.getUserColor(user.uid);
            const initials = this.getInitials(user.displayName);

            return div(
                {
                    className: style.avatar,
                    style: `background-color: ${color};`,
                    title: `${user.displayName} (${user.email})`,
                },
                div({ className: style.initials, textContent: initials }),
                div({ className: style.activeIndicator }),
            );
        });

        const countBadge =
            this.users.length > 3
                ? div({
                      className: style.countBadge,
                      textContent: `+${this.users.length - 3}`,
                  })
                : null;

        this.append(...userElements.slice(0, 3));
        if (countBadge) this.append(countBadge);
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        presenceService.setInactive(this.projectId);
    }
}

customElements.define("presence-indicators", PresenceIndicators);
