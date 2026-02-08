// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button } from "chili-controls";
import type { IApplication } from "chili-core";
import style from "./aiChat.module.css";
import { AIChatPanel } from "./aiChat";

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
            this.chatPanel = new AIChatPanel(this.app);
            document.body.appendChild(this.chatPanel);
        }
    }
}

customElements.define("chili-ai-chat-toggle", AIChatToggle);
