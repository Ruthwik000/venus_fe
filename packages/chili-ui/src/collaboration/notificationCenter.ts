// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div } from "chili-controls";
import { type Notification, notificationService } from "chili-core";
import type { Unsubscribe } from "firebase/firestore";
import style from "./notificationCenter.module.css";

export class NotificationCenter extends HTMLElement {
    private unsubscribe?: Unsubscribe;
    private notifications: Notification[] = [];
    private isOpen = false;
    private bellButton: HTMLElement;
    private dropdown: HTMLElement;
    private badge: HTMLElement;

    constructor() {
        super();
        this.className = style.container;

        this.badge = div({ className: style.badge, textContent: "0" });
        this.bellButton = div(
            {
                className: style.bellButton,
                onclick: () => this.toggle(),
            },
            div({ className: style.bellIcon, textContent: "🔔" }),
            this.badge,
        );

        this.dropdown = div({ className: style.dropdown, style: "display: none;" });

        this.append(this.bellButton, this.dropdown);
        this.subscribeToNotifications();
    }

    private async subscribeToNotifications() {
        try {
            // Check if user is authenticated
            const { auth } = await import("chili-core");
            if (!auth.currentUser) {
                // User not logged in, don't subscribe
                return;
            }

            this.unsubscribe = notificationService.subscribeToNotifications((notifications) => {
                this.notifications = notifications;
                this.updateBadge();
                if (this.isOpen) {
                    this.renderDropdown();
                }
            });
        } catch (error) {
            console.error("Failed to subscribe to notifications:", error);
        }
    }

    private updateBadge() {
        const unreadCount = this.notifications.filter((n) => !n.read).length;
        this.badge.textContent = unreadCount.toString();
        this.badge.style.display = unreadCount > 0 ? "flex" : "none";
    }

    private toggle() {
        this.isOpen = !this.isOpen;
        this.dropdown.style.display = this.isOpen ? "block" : "none";
        if (this.isOpen) {
            this.renderDropdown();
        }
    }

    private renderDropdown() {
        this.dropdown.innerHTML = "";

        const header = div(
            { className: style.dropdownHeader },
            div({ className: style.dropdownTitle, textContent: "Notifications" }),
            button({
                className: style.markAllButton,
                textContent: "Mark all read",
                onclick: () => this.markAllAsRead(),
            }),
        );

        const list = div({ className: style.notificationList });

        if (this.notifications.length === 0) {
            list.append(
                div({
                    className: style.emptyState,
                    textContent: "No notifications",
                }),
            );
        } else {
            this.notifications.forEach((notification) => {
                list.append(this.createNotificationElement(notification));
            });
        }

        this.dropdown.append(header, list);
    }

    private createNotificationElement(notification: Notification): HTMLElement {
        const typeIcons: Record<string, string> = {
            access_request: "🔑",
            comment: "💬",
            mention: "@",
            team_invite: "👥",
            project_shared: "🔗",
        };

        const icon = typeIcons[notification.type] || "📢";

        return div(
            {
                className: `${style.notification} ${notification.read ? style.read : ""}`,
                onclick: () => this.handleNotificationClick(notification),
            },
            div({ className: style.notificationIcon, textContent: icon }),
            div(
                { className: style.notificationContent },
                div({ className: style.notificationTitle, textContent: notification.title }),
                div({ className: style.notificationMessage, textContent: notification.message }),
                div({
                    className: style.notificationTime,
                    textContent: this.formatTime(notification.createdAt),
                }),
            ),
            !notification.read ? div({ className: style.unreadDot }) : null,
        );
    }

    private async handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            await notificationService.markAsRead(notification.id);
        }

        if (notification.link) {
            window.location.href = notification.link;
        }

        this.toggle();
    }

    private async markAllAsRead() {
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }

    private formatTime(timestamp: any): string {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    connectedCallback() {
        // Close dropdown when clicking outside
        document.addEventListener("click", this.handleOutsideClick);
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        document.removeEventListener("click", this.handleOutsideClick);
    }

    private handleOutsideClick = (e: MouseEvent) => {
        if (!this.contains(e.target as Node) && this.isOpen) {
            this.toggle();
        }
    };
}

customElements.define("notification-center", NotificationCenter);
