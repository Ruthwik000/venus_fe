// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button } from "chili-controls";
import type { IApplication } from "chili-core";
import { AIChatPanel } from "./aiChat";
import style from "./aiChat.module.css";

export class AIChatToggle extends HTMLElement {
    private chatPanel?: AIChatPanel;
    private toggleBtn: HTMLButtonElement;

    constructor(private readonly app: IApplication) {
        super();

        this.toggleBtn = button({
            className: style.toggleButton,
            textContent: "🤖",
            onclick: () => this.toggleChat(),
            title: "AI Model Generator",
        }) as HTMLButtonElement;

        this.appendChild(this.toggleBtn);
    }

    private toggleChat() {
        if (this.chatPanel && document.body.contains(this.chatPanel)) {
            this.chatPanel.remove();
            this.chatPanel = undefined;
        } else {
            // Pass session ID from URL params so WebSocket uses the correct project session
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get("sessionId") || urlParams.get("session") || undefined;
            this.chatPanel = new AIChatPanel(this.app, sessionId);
            this.chatPanel.ensureConnection();
            document.body.appendChild(this.chatPanel);
        }
    }
}

customElements.define("chili-ai-chat-toggle", AIChatToggle);
