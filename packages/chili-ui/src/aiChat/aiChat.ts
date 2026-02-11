// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div, input } from "chili-controls";
import { authService, type IApplication, Logger } from "chili-core";
import style from "./aiChat.module.css";

interface Message {
    role: "user" | "assistant" | "loading" | "question" | "typing" | "tool";
    content: string;
    questions?: Question[];
    streaming?: boolean;
    metadata?: any;
}

interface Question {
    question: string;
    options?: (string | { label: string; value: string })[];
    key?: string;
}

interface PendingQuestions {
    questions: Question[];
}

export class AIChatPanel extends HTMLElement {
    private messages: Message[] = [];
    private messagesContainer: HTMLDivElement;
    private inputField: HTMLTextAreaElement;
    private sendButton: HTMLButtonElement;
    private isProcessing: boolean = false;
    private sessionId: string;
    private uid: string;
    private sessionIdInput: HTMLInputElement;
    private saveSessionButton: HTMLButtonElement;
    private pendingQuestions: PendingQuestions | null = null;
    private ws: WebSocket | null = null;
    private currentMessageElement: HTMLDivElement | null = null;
    private currentMessage: Message | null = null;
    private wsConnected: boolean = false;
    private connectionStatus: HTMLSpanElement;
    private currentIntent: string | null = null;
    private intentBadge: HTMLSpanElement;

    constructor(private readonly app: IApplication) {
        super();
        this.className = style.chatContainer;

        this.messagesContainer = div({ className: style.chatMessages });
        this.inputField = document.createElement("textarea") as HTMLTextAreaElement;
        this.inputField.className = style.inputField;
        this.inputField.placeholder = "Ask me to create a CAD model, modify it, or answer questions...";

        // Use project session ID if available, otherwise generate a new one
        const projectSessionId = localStorage.getItem("currentSessionId");
        this.sessionId = projectSessionId || this.generateUUID();
        // Use authenticated user's UID
        const currentUser = authService.getCurrentUser();
        this.uid = currentUser?.uid ?? "anonymous";

        this.sessionIdInput = input({
            className: style.sessionInput,
            placeholder: "Session ID",
            type: "text",
            value: this.sessionId,
        }) as HTMLInputElement;

        this.saveSessionButton = button({
            className: style.saveSessionButton,
            textContent: "Save",
            onclick: () => this.handleSaveSession(),
        }) as HTMLButtonElement;

        this.sendButton = button({
            className: style.sendButton,
            textContent: "Send",
            onclick: () => this.handleSendMessage(),
        }) as HTMLButtonElement;

        this.connectionStatus = document.createElement("span");
        this.connectionStatus.className = style.connectionStatus;

        this.intentBadge = document.createElement("span");
        this.intentBadge.className = style.intentBadge;
        this.intentBadge.style.display = "none";

        this.render();
        this.setupInputHandlers();
        this.connectWebSocket();
    }

    private generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private connectWebSocket() {
        const wsUrl = `ws://localhost:8000/ws/chat/${this.sessionId}`;
        Logger.info("Connecting to WebSocket:", wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                Logger.info("WebSocket connected");
                this.wsConnected = true;
                this.updateConnectionStatus(true);
            };

            this.ws.onclose = () => {
                Logger.info("WebSocket disconnected");
                this.wsConnected = false;
                this.updateConnectionStatus(false);
                // Attempt to reconnect after 2 seconds
                setTimeout(() => this.connectWebSocket(), 2000);
            };

            this.ws.onerror = (error) => {
                Logger.error("WebSocket error:", error);
                this.addMessage({
                    role: "assistant",
                    content:
                        "❌ Connection error. Make sure the backend server is running on http://localhost:8000",
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    Logger.error("Error parsing WebSocket message:", error);
                }
            };
        } catch (error) {
            Logger.error("Failed to create WebSocket:", error);
            this.wsConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    private updateConnectionStatus(connected: boolean) {
        if (connected) {
            this.connectionStatus.textContent = "🟢 Connected";
            this.connectionStatus.className = `${style.connectionStatus} ${style.connected}`;
            this.sendButton.disabled = false;
            this.inputField.disabled = false;
        } else {
            this.connectionStatus.textContent = "🔴 Disconnected";
            this.connectionStatus.className = `${style.connectionStatus} ${style.disconnected}`;
            this.sendButton.disabled = true;
            this.inputField.disabled = true;
        }
    }

    private handleWebSocketMessage(data: any) {
        console.log("🔔 WebSocket Message Received:", data);
        console.log("Message Type:", data.type);
        Logger.info("Received WebSocket message:", data);

        switch (data.type) {
            case "intent_detected":
                this.handleIntentDetection(data);
                break;

            case "typing":
                this.showTypingIndicator();
                break;

            case "tool_executing":
                this.showToolExecution(data);
                break;

            case "response_chunk":
                this.appendTextChunk(data);
                break;

            case "questions":
                this.showClarifyingQuestions(data);
                break;

            case "complete":
                console.log("🎉 COMPLETE MESSAGE RECEIVED");
                this.handleComplete(data);
                break;

            case "error":
                this.showError(data);
                break;

            default:
                console.warn("❓ Unknown message type:", data.type);
                Logger.warn("Unknown message type:", data.type);
        }
    }

    private handleIntentDetection(data: any) {
        this.currentIntent = data.intent;
        const confidence = Math.round((data.confidence || 0) * 100);
        Logger.info(`Intent detected: ${data.intent} (${confidence}% confident)`);

        // Update intent badge
        this.intentBadge.textContent = data.intent.replace("_", " ").toUpperCase();
        this.intentBadge.style.display = "inline-block";
    }

    private showTypingIndicator() {
        // Remove existing typing indicator if any
        this.removeTypingIndicator();

        const typingDiv = div({ className: style.typingIndicator });
        typingDiv.innerHTML = "<span>●</span><span>●</span><span>●</span>";
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private removeTypingIndicator() {
        const typingIndicators = this.messagesContainer.querySelectorAll(`.${style.typingIndicator}`);
        typingIndicators.forEach((indicator) => indicator.remove());
    }

    private showToolExecution(data: any) {
        this.removeTypingIndicator();

        const toolMessage: Message = {
            role: "tool",
            content: data.data.description || `Running ${data.data.tool}...`,
        };

        const messageEl = this.createMessageElement(toolMessage);
        this.messagesContainer.appendChild(messageEl);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        this.messages.push(toolMessage);
    }

    private appendTextChunk(data: any) {
        this.removeTypingIndicator();

        if (!this.currentMessage || !this.currentMessageElement) {
            // Start new bot message
            this.currentMessage = {
                role: "assistant",
                content: data.content,
                streaming: true,
                metadata: data.metadata,
            };
            this.currentMessageElement = this.createMessageElement(this.currentMessage);
            this.currentMessageElement.classList.add(style.streaming);
            this.messagesContainer.appendChild(this.currentMessageElement);
            this.messages.push(this.currentMessage);
        } else {
            // Append to existing message
            this.currentMessage.content += data.content;
            this.currentMessageElement.textContent = this.currentMessage.content;
        }

        // Auto-scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private showClarifyingQuestions(data: any) {
        this.removeTypingIndicator();
        this.finalizeCurrentMessage();

        if (data.questions && data.questions.length > 0) {
            this.pendingQuestions = {
                questions: data.questions,
            };

            // Show interactive question form
            this.showQuestionForm(data.questions);

            // Hide normal input while questions are active
            this.inputField.style.display = "none";
            this.sendButton.style.display = "none";
        }
    }

    private async handleComplete(data: any) {
        console.log("🎯 handleComplete called");
        console.log("Complete data structure:", JSON.stringify(data, null, 2));

        this.removeTypingIndicator();
        this.finalizeCurrentMessage();

        Logger.info("Response complete - Full data:", JSON.stringify(data, null, 2));

        // Hide intent badge after completion
        this.intentBadge.style.display = "none";
        this.currentIntent = null;

        // Try multiple possible paths for download URL
        let downloadUrl = null;

        console.log("Checking data.data:", data.data);
        console.log("Checking data.data?.download_urls:", data.data?.download_urls);
        console.log("Checking data.data?.download_url:", data.data?.download_url);
        console.log("Checking data.data?.files:", data.data?.files);

        if (data.data && data.data.download_urls) {
            // Backend returns download_urls object with step/stl keys
            const urls = data.data.download_urls;
            downloadUrl =
                urls.step ||
                urls.stl ||
                Object.values(urls).find((u: any) => typeof u === "string" && u.length > 0);
            console.log("✅ Found in data.data.download_urls:", downloadUrl);
        } else if (data.data && data.data.download_url) {
            downloadUrl = data.data.download_url;
            console.log("✅ Found in data.data.download_url:", downloadUrl);
        } else if (data.download_urls) {
            const urls = data.download_urls;
            downloadUrl =
                urls.step ||
                urls.stl ||
                Object.values(urls).find((u: any) => typeof u === "string" && u.length > 0);
            console.log("✅ Found in data.download_urls:", downloadUrl);
        } else if (data.download_url) {
            downloadUrl = data.download_url;
            console.log("✅ Found in data.download_url:", downloadUrl);
        } else if (data.data && data.data.files) {
            // Check for files object
            if (data.data.files.step) {
                downloadUrl = data.data.files.step;
                console.log("✅ Found in data.data.files.step:", downloadUrl);
            } else if (data.data.files.stl) {
                downloadUrl = data.data.files.stl;
                console.log("✅ Found in data.data.files.stl:", downloadUrl);
            }
        } else if (data.files) {
            // Check for files at root level
            if (data.files.step) {
                downloadUrl = data.files.step;
                console.log("✅ Found in data.files.step:", downloadUrl);
            } else if (data.files.stl) {
                downloadUrl = data.files.stl;
                console.log("✅ Found in data.files.stl:", downloadUrl);
            }
        }

        // Auto-download and import model if available
        if (downloadUrl) {
            console.log("🚀 Attempting to download and import from:", downloadUrl);
            Logger.info("Found download URL:", downloadUrl);
            const fullUrl = downloadUrl.startsWith("http")
                ? downloadUrl
                : `http://localhost:8000${downloadUrl}`;
            console.log("Full URL:", fullUrl);
            Logger.info("Full URL:", fullUrl);

            try {
                await this.downloadAndImportFromUrl(fullUrl);
                console.log("✅ Download and import completed successfully");
            } catch (error) {
                console.error("❌ Error during download/import:", error);
            }
        } else {
            console.error("❌ NO DOWNLOAD URL FOUND!");
            console.log("Complete data was:", data);
            Logger.warn("No download URL found in complete message");
        }

        // Re-enable processing
        this.isProcessing = false;
        this.sendButton.disabled = false;
        this.inputField.disabled = false;
    }

    private showError(data: any) {
        this.removeTypingIndicator();
        this.finalizeCurrentMessage();

        const errorMessage = data.data?.message || data.message || "An error occurred";
        this.addMessage({
            role: "assistant",
            content: `❌ ${errorMessage}`,
        });

        this.isProcessing = false;
        this.sendButton.disabled = false;
        this.inputField.disabled = false;
        this.intentBadge.style.display = "none";
    }

    private finalizeCurrentMessage() {
        if (this.currentMessageElement && this.currentMessage) {
            this.currentMessageElement.classList.remove(style.streaming);
            this.currentMessage.streaming = false;
        }
        this.currentMessageElement = null;
        this.currentMessage = null;
    }

    private render() {
        const header = div(
            { className: style.chatHeader },
            div({ className: style.chatTitle, textContent: "CAD Copilot" }),
            this.intentBadge,
            this.connectionStatus,
        );

        const sessionContainer = div(
            { className: style.sessionContainer },
            this.sessionIdInput,
            this.saveSessionButton,
        );

        const inputContainer = div({ className: style.chatInput }, this.inputField, this.sendButton);

        const resizer = div({
            className: style.chatResizer,
            onmousedown: (e: MouseEvent) => this.startResize(e),
        });

        this.append(resizer, header, sessionContainer, this.messagesContainer, inputContainer);
    }

    private startResize(e: MouseEvent) {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = this.offsetWidth;

        const onMouseMove = (ev: MouseEvent) => {
            const diff = startX - ev.clientX;
            const newWidth = Math.max(300, Math.min(600, startWidth + diff));
            this.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    private handleSaveSession() {
        const inputValue = this.sessionIdInput.value.trim();
        if (inputValue && inputValue !== this.sessionId) {
            // Reconnect with new session ID
            if (this.ws) {
                this.ws.close();
            }
            this.sessionId = inputValue;
            this.connectWebSocket();
            this.addMessage({
                role: "assistant",
                content: `Switched to session: ${this.sessionId}`,
            });
            Logger.info(`Session ID changed to: ${this.sessionId}`);
        } else {
            this.addMessage({
                role: "assistant",
                content: `Current session: ${this.sessionId}`,
            });
        }
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

    private handleSendMessage() {
        const prompt = this.inputField.value.trim();
        if (!prompt || this.isProcessing || !this.wsConnected) return;

        this.isProcessing = true;
        this.sendButton.disabled = true;
        this.inputField.disabled = true;
        this.inputField.value = "";
        this.inputField.style.height = "40px";

        // Add user message
        this.addMessage({ role: "user", content: prompt });

        // Send via WebSocket
        this.sendWebSocketMessage(prompt);
    }

    private sendWebSocketMessage(message: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.addMessage({
                role: "assistant",
                content: "❌ Not connected to server. Reconnecting...",
            });
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.inputField.disabled = false;
            return;
        }

        const data = {
            message: message,
            uid: this.uid,
            type: "user_message",
        };

        try {
            this.ws.send(JSON.stringify(data));
            Logger.info("Sent message:", data);
        } catch (error) {
            Logger.error("Error sending message:", error);
            this.addMessage({
                role: "assistant",
                content: `❌ Error sending message: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.inputField.disabled = false;
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
                    accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
            });
        } catch (fetchError) {
            throw new Error(
                "Cannot connect to the API server. Make sure the backend is running on http://127.0.0.1:8000",
            );
        }
    }

    private showQuestionForm(questions: Question[]) {
        const formContainer = div({ className: style.questionFormContainer });

        const title = div({
            className: style.questionFormTitle,
            textContent: "Please answer the following questions:",
        });
        formContainer.appendChild(title);

        const answersMap = new Map<
            number,
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | string
        >();

        questions.forEach((q, index) => {
            const questionBlock = div({ className: style.questionBlock });

            const questionLabel = div({
                className: style.questionLabel,
                textContent: `${index + 1}. ${q.question}`,
            });
            questionBlock.appendChild(questionLabel);

            if (q.options && q.options.length > 0) {
                // Create selectable buttons for options
                const optionsContainer = div({ className: style.questionButtons });

                q.options.forEach((option, optionIndex) => {
                    const optionValue =
                        typeof option === "object" && option !== null ? (option as any).value : option;
                    const optionLabel =
                        typeof option === "object" && option !== null ? (option as any).label : option;

                    const optionButton = button({
                        className: style.optionButton,
                        textContent: optionLabel,
                        onclick: (e: Event) => {
                            // Just select this option, don't submit yet
                            const btn = e.target as HTMLButtonElement;

                            // Deselect all buttons in this question
                            optionsContainer.querySelectorAll("button").forEach((b) => {
                                b.classList.remove(style.optionButtonSelected);
                            });

                            // Select this button
                            btn.classList.add(style.optionButtonSelected);

                            // Store the answer
                            answersMap.set(index, optionLabel);
                        },
                    }) as HTMLButtonElement;

                    // Select first option by default
                    if (optionIndex === 0) {
                        optionButton.classList.add(style.optionButtonSelected);
                        answersMap.set(index, optionLabel);
                    }

                    optionsContainer.appendChild(optionButton);
                });

                questionBlock.appendChild(optionsContainer);
            } else {
                // Free text input for questions without options
                const textInput = document.createElement("textarea") as HTMLTextAreaElement;
                textInput.className = style.questionTextInput;
                textInput.placeholder = "Enter your answer...";
                textInput.rows = 2;
                questionBlock.appendChild(textInput);
                answersMap.set(index, textInput);
            }

            formContainer.appendChild(questionBlock);
        });

        // Always show submit button
        const submitButton = button({
            className: style.submitAnswersButton,
            textContent: "Submit Answers",
            onclick: () => {
                // Collect all answers
                const answers: string[] = [];
                questions.forEach((q, index) => {
                    const value = answersMap.get(index);
                    if (typeof value === "string") {
                        answers.push(value);
                    } else if (value) {
                        answers.push(value.value);
                    }
                });

                // Remove the form
                formContainer.remove();

                // Show submitted answers
                const answersText = answers.join(", ");
                this.addMessage({
                    role: "user",
                    content: answersText,
                });

                // Clear pending questions and restore normal input
                this.pendingQuestions = null;
                this.inputField.style.display = "";
                this.sendButton.style.display = "";

                // Send answers via WebSocket
                this.sendWebSocketMessage(answersText);
            },
        }) as HTMLButtonElement;

        formContainer.appendChild(submitButton);

        this.messagesContainer.appendChild(formContainer);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    private async downloadAndImportFromUrl(fileUrl: string) {
        try {
            console.log("📥 downloadAndImportFromUrl called with:", fileUrl);
            Logger.info("Starting download from URL:", fileUrl);

            this.addMessage({
                role: "assistant",
                content: "Downloading model file...",
            });

            let response: Response;
            try {
                console.log("Fetching from URL...");
                response = await fetch(fileUrl, {
                    method: "GET",
                    mode: "cors",
                });
                console.log("Fetch response:", response.status, response.statusText);
                Logger.info("Fetch response status:", response.status, response.statusText);
            } catch (fetchError) {
                console.error("❌ Fetch error:", fetchError);
                Logger.error("Fetch error:", fetchError);
                throw new Error("Cannot connect to download server");
            }

            if (!response.ok) {
                console.error("❌ Response not OK:", response.status);
                throw new Error(`Failed to download file (${response.status}): ${response.statusText}`);
            }

            console.log("Converting to blob...");
            const blob = await response.blob();
            console.log("Blob size:", blob.size, "bytes");

            // Determine file type and name from URL
            const fileExtension = fileUrl.split(".").pop()?.toLowerCase() || "step";
            const fileName = `generated_model.${fileExtension}`;
            const mimeType = fileExtension === "stl" ? "model/stl" : "application/step";

            console.log("Creating File object:", fileName, mimeType);
            const file = new File([blob], fileName, { type: mimeType });

            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: "Importing model into the scene...",
            });

            console.log("Getting or creating document...");
            // Import the file into the application
            const document = this.app.activeView?.document ?? (await this.app.newDocument("Untitled"));
            console.log("Document ready, importing file...");

            await this.app.dataExchange.import(document, [file]);
            console.log("✅ Import successful!");

            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: "Model imported successfully! ✓",
            });

            // Fit the view to the new content
            if (this.app.activeView?.cameraController) {
                console.log("Fitting camera to content...");
                setTimeout(() => {
                    this.app.activeView?.cameraController.fitContent();
                }, 100);
            }
        } catch (error) {
            console.error("❌ Error in downloadAndImportFromUrl:", error);
            Logger.error("Error importing file:", error);
            this.removeLastMessage();
            this.addMessage({
                role: "assistant",
                content: `Error importing model: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }
    }

    private createMessageElement(message: Message): HTMLDivElement {
        const messageEl = div({ className: style.message });

        if (message.role === "user") {
            messageEl.classList.add(style.userMessage);
        } else if (message.role === "loading") {
            messageEl.classList.add(style.loadingMessage);
        } else if (message.role === "tool") {
            messageEl.classList.add(style.toolMessage);
        } else if (message.role === "typing") {
            messageEl.classList.add(style.typingIndicator);
        } else {
            messageEl.classList.add(style.assistantMessage);
        }

        messageEl.textContent = message.content;
        return messageEl;
    }

    private addMessage(message: Message) {
        this.messages.push(message);
        const messageEl = this.createMessageElement(message);
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
        // Close WebSocket connection
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.remove();
    }

    // Cleanup on disconnect
    disconnectedCallback() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

customElements.define("chili-ai-chat-panel", AIChatPanel);
