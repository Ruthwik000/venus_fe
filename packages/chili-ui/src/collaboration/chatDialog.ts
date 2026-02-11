// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div, input } from "chili-controls";
import { type ChatMessage, chatService } from "chili-core";
import type { Unsubscribe } from "firebase/firestore";
import style from "./chatDialog.module.css";

export class ChatDialog extends HTMLElement {
    private unsubscribe?: Unsubscribe;
    private messages: ChatMessage[] = [];
    private chatInput?: HTMLInputElement;

    constructor(private projectId: string) {
        super();
        this.className = style.overlay;
        this.style.display = "none";
        this.render();
        this.setupEventListeners();
    }

    show() {
        this.style.display = "flex";
        this.subscribeToMessages();
        this.chatInput?.focus();
    }

    hide() {
        this.style.display = "none";
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    private subscribeToMessages() {
        if (this.unsubscribe) return;

        this.unsubscribe = chatService.subscribeToMessages((messages) => {
            this.messages = messages;
            this.renderMessages();
        });
    }

    private render() {
        const dialog = div(
            { className: style.dialog },
            div(
                { className: style.header },
                div({ className: style.title, textContent: "Chat" }),
                button({
                    className: style.closeButton,
                    textContent: "×",
                    onclick: () => this.hide(),
                }),
            ),
            div({ id: "chat-messages-list", className: style.messagesList }),
            div(
                { className: style.inputContainer },
                (this.chatInput = input({
                    type: "text",
                    placeholder: "Type a message...",
                    className: style.input,
                })),
                button({
                    className: style.sendButton,
                    textContent: "Send",
                    onclick: () => this.sendMessage(),
                }),
            ),
        );

        this.appendChild(dialog);
    }

    private renderMessages() {
        const messagesList = this.querySelector("#chat-messages-list");
        if (!messagesList) return;

        messagesList.innerHTML = "";

        if (this.messages.length === 0) {
            messagesList.appendChild(
                div({
                    className: style.emptyState,
                    textContent: "No messages yet. Start a conversation!",
                }),
            );
            return;
        }

        // Display messages (newest first from Firestore, but we reverse for display)
        const reversedMessages = [...this.messages].reverse();
        for (const msg of reversedMessages) {
            const messageDiv = div(
                { className: style.message },
                div(
                    { className: style.messageHeader },
                    div({ className: style.messageSender, textContent: msg.displayName }),
                    div({
                        className: style.messageTime,
                        textContent: new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    }),
                ),
                div({ className: style.messageContent, textContent: msg.message }),
            );

            messagesList.appendChild(messageDiv);
        }

        // Scroll to bottom
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    private async sendMessage() {
        if (!this.chatInput || !this.chatInput.value.trim()) return;

        try {
            await chatService.sendMessage(this.chatInput.value.trim());
            this.chatInput.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message. Please try again.");
        }
    }

    private setupEventListeners() {
        // Close on overlay click
        this.addEventListener("click", (e) => {
            if (e.target === this) {
                this.hide();
            }
        });

        // Send on Enter key
        this.chatInput?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.sendMessage();
            }
        });
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

customElements.define("chat-dialog", ChatDialog);
