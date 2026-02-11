// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { command, type IApplication, type ICommand } from "chili-core";

@command({
    key: "doc.new",
    icon: "icon-new",
    isApplicationCommand: true,
})
export class NewDocument implements ICommand {
    async execute(_app: IApplication): Promise<void> {
        // Navigate to dashboard instead of creating a new document
        window.location.href = "/dashboard";
    }
}
