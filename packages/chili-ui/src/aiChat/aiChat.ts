// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div } from "chili-controls";
import { type IApplication, Logger, PubSub, I18n } from "chili-core";
import style from "./aiChat.module.css";

interface Message {
    role: "user" | "assistant" | "loading";
    content: string;
}

export class AIChatPanel extends HTMLElement {
    private messages: Message[] = [];
    private messagesContainer: HTMLDivElement;
    private inputField: HTMLTextAreaElement;
    private sendButton: HTMLButtonElement;
    private isProcessing: boolean = false;

    constructor(private readonly app: IApplication) {
        super();
        this.className = style.chatContainer;

        this.messagesContainer = div({ className: style.chatMessages });
        this.inputField = document.createElement("textarea") as HTMLTextAreaElement;
        this.inputField.className = style.inputField;
        this.inputField.placeholder = "Describe the 3D model you want to generate...";

        this.sendButton = button({
            className: style.sendButton,
            textContent: "Send",
            onclick: () => this.handleSendMessage(),
        }) as HTMLButtonElement;

        this.render();
        this.setupInputHandlers();
    }

    private render() {
        const header = div(
            { className: style.chatHeader },
            div({ className: style.chatTitle, textContent: "AI Model Generator" }),
            button({
                className: style.closeButton,
                textContent: "×",
                onclick: () => this.close(),
            }),
        );

        const inputContainer = div(
            { className: style.chatInput },
            this.inputField,
            this.sendButton,
        );

        this.append(header, this.messagesContainer, inputContainer);
    }

    private setupInputHandlers() {
        this.inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.inputField.addEventListener("input", () => {
            this.inputField.style.height = "auto";
            this.inputField.style.height = `${Math.min(this.inputField.scrollHeight, 120)}px`;
        });
    }

    private async handleSendMessage() {
        const prompt = this.inputField.value.trim();
        if (!prompt || this.isProcessing) return;

        this.isProcessing = true;
        this.sendButton.disabled = true;
        this.inputField.disabled = true;
        this.inputField.value = "";
        this.inputField.style.height = "40px";

        // Add user message
        this.addMessage({ role: "user", content: prompt });

        // Add loading message
        this.addMessage({ role: "loading", content: "Generating model..." });

        try {
            await this.generateModel(prompt);
        } catch (error) {
            Logger.error("Error generating model:", error);
            this.removeLoadingMessage();
            this.addMessage({
                role: "assistant",
                content: `Error: ${error instanceof Error ? error.message : "Failed to generate model"}`,
            });
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.inputField.disabled = false;
            this.inputField.focus();
        }
    }

    private async generateModel(prompt: string) {
        let response: Response;
        
        try {
            // Call the generation API
            response = await fetch("http://127.0.0.1:8000/generate", {
                method: "POST",
                mode: "cors",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
            });
        } catch (fetchError) {
            throw new Error("Cannot connect to the API server. Make sure the backend is running on http://127.0.0.1:8000");
        }

        if (!response.ok) {
            let errorText = "";
            try {
                errorText = await response.text();
            } catch {
                errorText = response.statusText;
            }
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        let data: any;
        try {
            data = await response.json();
        } catch {
            throw new Error("Invalid JSON response from server");
        }

        if (!data.job_id || !data.files) {
            throw new Error("Invalid response format from server");
        }

        this.removeLoadingMessage();
        this.addMessage({
            role: "assistant",
            content: `Model generated successfully! Job ID: ${data.job_id}`,
        });

        // Download and import the STEP file
        await this.downloadAndImportStep(data.job_id);
    }

    private async downloadAndImportStep(jobId: string) {
        try {
            const stepUrl = `http://127.0.0.1:8000/download/${jobId}/model.step`;

            this.addMessage({
                role: "assistant",
                content: "Downloading STEP file...",
            });

            let response: Response;
            try {
                response = await fetch(stepUrl, {
                    method: "GET",
                    mode: "cors",
                });
            } catch (fetchError) {
                throw new Error("Cannot connect to download server");
            }

            if (!response.ok) {
                throw new Error(`Failed to download STEP file (${response.status}): ${response.statusText}`);
            }

            const blob = await response.blob();
            const file = new File([blob], "generated_model.step", { type: "application/step" });

            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: "Importing model into the scene...",
            });

            // Import the file into the application
            const document = this.app.activeView?.document ?? (await this.app.newDocument("Untitled"));
            await this.app.dataExchange.import(document, [file]);

            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: "Model imported successfully! ✓",
            });

            // Fit the view to the new content
            if (this.app.activeView?.cameraController) {
                setTimeout(() => {
                    this.app.activeView?.cameraController.fitContent();
                }, 100);
            }
        } catch (error) {
            Logger.error("Error importing STEP file:", error);
            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: `Error importing model: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }
    }

    private addMessage(message: Message) {
        this.messages.push(message);
        const messageEl = div({ className: style.message });

        if (message.role === "user") {
            messageEl.classList.add(style.userMessage);
        } else if (message.role === "loading") {
            messageEl.classList.add(style.loadingMessage);
        } else {
            messageEl.classList.add(style.assistantMessage);
        }

        messageEl.textContent = message.content;
        this.messagesContainer.appendChild(messageEl);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private removeLoadingMessage() {
        if (this.messages.length > 0 && this.messages[this.messages.length - 1].role === "loading") {
            this.messages.pop();
            const lastChild = this.messagesContainer.lastElementChild;
            if (lastChild) {
                this.messagesContainer.removeChild(lastChild);
            }
        }
    }

    private removeLastMessage() {
        if (this.messages.length > 0) {
            this.messages.pop();
            const lastChild = this.messagesContainer.lastElementChild;
            if (lastChild) {
                this.messagesContainer.removeChild(lastChild);
            }
        }
    }

    private close() {
        this.remove();
    }
}

customElements.define("chili-ai-chat-panel", AIChatPanel);
