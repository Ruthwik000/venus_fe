// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { div, span } from "chili-controls";
import { I18n, type I18nKeys } from "chili-core";
import style from "./permanent.module.css";

export class Permanent {
    static async show(action: () => Promise<void>, message: I18nKeys, ...args: any[]) {
        const dialog = document.createElement("dialog");
        dialog.appendChild(
            div(
                { className: style.container },
                div(
                    { className: style.spinnerContainer },
                    div({
                        className: style.outerRing,
                    }),
                    div({
                        className: style.middleRing,
                    }),
                    div({
                        className: style.innerRing,
                    }),
                    div({
                        className: style.centerDot,
                    }),
                ),
                span({
                    className: style.message,
                    textContent: I18n.translate(message, ...args),
                }),
                div(
                    { className: style.dotsContainer },
                    div({ className: style.dot }),
                    div({ className: style.dot }),
                    div({ className: style.dot }),
                ),
            ),
        );
        document.body.appendChild(dialog);
        dialog.showModal();

        action().finally(() => dialog.remove());
    }
}
