// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { div } from "chili-controls";
import style from "./loader.module.css";

export class Loader {
    private container: HTMLElement;
    private animationFrameId: number | null = null;

    constructor() {
        this.container = this.createLoader();
    }

    private createLoader(): HTMLElement {
        const dot1 = div({ className: style.dot });
        const dot2 = div({ className: style.dot });
        const dot3 = div({ className: style.dot });

        const loaderContainer = div({ className: style.loader }, dot1, dot2, dot3);

        const overlay = div({ className: style.overlay }, loaderContainer);

        return overlay;
    }

    show(): void {
        if (!document.body.contains(this.container)) {
            document.body.appendChild(this.container);
        }
        this.container.style.display = "flex";
    }

    hide(): void {
        this.container.style.display = "none";
    }

    remove(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (document.body.contains(this.container)) {
            document.body.removeChild(this.container);
        }
    }
}

export const createLoader = (): Loader => {
    return new Loader();
};
