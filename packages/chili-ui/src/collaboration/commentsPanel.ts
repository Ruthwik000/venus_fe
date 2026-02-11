// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { button, div, textarea } from "chili-controls";
import { type Comment, commentService } from "chili-core";
import type { Unsubscribe } from "firebase/firestore";
import style from "./commentsPanel.module.css";

export class CommentsPanel extends HTMLElement {
    private unsubscribe?: Unsubscribe;
    private comments: Comment[] = [];
    private commentInput: HTMLTextAreaElement;
    private commentsList: HTMLDivElement;
    private showResolved = false;

    constructor(private projectId: string) {
        super();
        this.className = style.panel;

        this.commentInput = textarea({
            className: style.input,
            placeholder: "Add a comment...",
            rows: 3,
        }) as HTMLTextAreaElement;

        this.commentsList = div({ className: style.commentsList });

        this.render();
        this.subscribeToComments();
    }

    private subscribeToComments() {
        this.unsubscribe = commentService.subscribeToComments(this.projectId, (comments) => {
            this.comments = comments;
            this.renderComments();
        });
    }

    private render() {
        const header = div(
            { className: style.header },
            div({ className: style.title, textContent: "Comments" }),
            div(
                { className: style.headerActions },
                button({
                    className: style.filterButton,
                    textContent: this.showResolved ? "Hide Resolved" : "Show Resolved",
                    onclick: () => this.toggleResolved(),
                }),
            ),
        );

        const inputSection = div(
            { className: style.inputSection },
            this.commentInput,
            button({
                className: style.postButton,
                textContent: "Post",
                onclick: () => this.handlePost(),
            }),
        );

        this.append(header, this.commentsList, inputSection);
    }

    private toggleResolved() {
        this.showResolved = !this.showResolved;
        this.renderComments();
        const filterBtn = this.querySelector(`.${style.filterButton}`) as HTMLButtonElement;
        if (filterBtn) {
            filterBtn.textContent = this.showResolved ? "Hide Resolved" : "Show Resolved";
        }
    }

    private async handlePost() {
        const content = this.commentInput.value.trim();
        if (!content) return;

        try {
            await commentService.addComment(this.projectId, content);
            this.commentInput.value = "";
        } catch (error) {
            console.error("Failed to post comment:", error);
            alert("Failed to post comment");
        }
    }

    private renderComments() {
        this.commentsList.innerHTML = "";

        const filteredComments = this.showResolved ? this.comments : this.comments.filter((c) => !c.resolved);

        if (filteredComments.length === 0) {
            this.commentsList.append(
                div({
                    className: style.emptyState,
                    textContent: "No comments yet",
                }),
            );
            return;
        }

        filteredComments.forEach((comment) => {
            this.commentsList.append(this.createCommentElement(comment));
        });
    }

    private createCommentElement(comment: Comment): HTMLElement {
        const replyInput = textarea({
            className: style.replyInput,
            placeholder: "Reply...",
            rows: 2,
            style: "display: none;",
        }) as HTMLTextAreaElement;

        const commentEl = div(
            {
                className: `${style.comment} ${comment.resolved ? style.resolved : ""}`,
            },
            div(
                { className: style.commentHeader },
                div(
                    { className: style.commentAuthor },
                    div({ className: style.authorName, textContent: comment.userName }),
                    div({
                        className: style.commentTime,
                        textContent: this.formatTime(comment.createdAt),
                    }),
                ),
                div(
                    { className: style.commentActions },
                    !comment.resolved
                        ? button({
                              className: style.actionButton,
                              textContent: "Resolve",
                              onclick: () => this.handleResolve(comment.id),
                          })
                        : div({
                              className: style.resolvedBadge,
                              textContent: "✓ Resolved",
                          }),
                ),
            ),
            div({ className: style.commentContent, textContent: comment.content }),
            comment.position
                ? div({
                      className: style.position,
                      textContent: `📍 Position: (${comment.position.x.toFixed(1)}, ${comment.position.y.toFixed(1)}, ${comment.position.z.toFixed(1)})`,
                  })
                : null,
            comment.replies.length > 0
                ? div(
                      { className: style.replies },
                      ...comment.replies.map((reply) =>
                          div(
                              { className: style.reply },
                              div(
                                  { className: style.replyHeader },
                                  div({ className: style.replyAuthor, textContent: reply.userName }),
                                  div({
                                      className: style.replyTime,
                                      textContent: this.formatTime(reply.createdAt),
                                  }),
                              ),
                              div({ className: style.replyContent, textContent: reply.content }),
                          ),
                      ),
                  )
                : null,
            div(
                { className: style.replySection },
                button({
                    className: style.replyButton,
                    textContent: "Reply",
                    onclick: () => {
                        replyInput.style.display = replyInput.style.display === "none" ? "block" : "none";
                    },
                }),
                replyInput,
                button({
                    className: style.postReplyButton,
                    textContent: "Post Reply",
                    style: replyInput.style.display === "none" ? "display: none;" : "",
                    onclick: () => this.handleReply(comment.id, replyInput),
                }),
            ),
        );

        return commentEl;
    }

    private async handleResolve(commentId: string) {
        try {
            await commentService.resolveComment(commentId);
        } catch (error) {
            console.error("Failed to resolve comment:", error);
        }
    }

    private async handleReply(commentId: string, input: HTMLTextAreaElement) {
        const content = input.value.trim();
        if (!content) return;

        try {
            await commentService.addReply(commentId, content);
            input.value = "";
            input.style.display = "none";
        } catch (error) {
            console.error("Failed to post reply:", error);
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

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

customElements.define("comments-panel", CommentsPanel);
