// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { command, type IApplication, type ICommand } from "chili-core";

@command({
    key: "doc.open",
    icon: "icon-open",
    isApplicationCommand: true,
})
export class OpenDocument implements ICommand {
    async execute(_app: IApplication): Promise<void> {
        // Navigate to dashboard to open projects
        window.location.href = "/dashboard";
    }
}
