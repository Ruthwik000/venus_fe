// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { div } from "chili-controls";
import {
    type AsyncController,
    type Button,
    type CommandKeys,
    type I18nKeys,
    type IApplication,
    type IDocument,
    type Material,
    PubSub,
    type RibbonTab,
} from "chili-core";
import { AIChatPanel } from "./aiChat";
import style from "./editor.module.css";
import { OKCancel } from "./okCancel";
import { ProjectView } from "./project";
import { PropertyView } from "./property";
import { MaterialDataContent, MaterialEditor } from "./property/material";
import { Ribbon, RibbonDataContent } from "./ribbon";
import { RibbonTabData } from "./ribbon/ribbonData";
import { Statusbar } from "./statusbar";
import { LayoutViewport } from "./viewport";

const quickCommands: CommandKeys[] = ["doc.save", "doc.saveToFile", "edit.undo", "edit.redo"];

export class Editor extends HTMLElement {
    readonly ribbonContent: RibbonDataContent;
    private readonly _selectionController: OKCancel;
    private readonly _viewportContainer: HTMLDivElement;
    private _sidebarWidth: number = 360;
    private _isResizingSidebar: boolean = false;
    private _sidebarEl: HTMLDivElement | null = null;
    private _isSidebarVisible: boolean = true;
    private _aiChatPanel: AIChatPanel | null = null;
    private _isAIChatVisible: boolean = false;

    constructor(
        readonly app: IApplication,
        tabs: RibbonTab[],
    ) {
        super();
        this.ribbonContent = new RibbonDataContent(app, quickCommands, tabs.map(RibbonTabData.fromProfile));
        const viewport = new LayoutViewport(app);
        viewport.classList.add(style.viewport);
        this._selectionController = new OKCancel();
        this._viewportContainer = div(
            { className: style.viewportContainer },
            this._selectionController,
            viewport,
        );
        this.clearSelectionControl();
        this.render();
    }

    private render() {
        this._sidebarEl = div(
            {
                className: style.sidebar,
                style: `width: ${this._sidebarWidth}px;`,
            },
            new ProjectView({ className: style.sidebarItem }),
            new PropertyView({ className: style.sidebarItem }),
            div({
                className: style.sidebarResizer,
                onmousedown: (e: MouseEvent) => this._startSidebarResize(e),
            }),
        );

        // Create AI chat panel but don't show it initially
        this._aiChatPanel = new AIChatPanel(this.app);
        this._aiChatPanel.style.display = "none";

        this.append(
            div(
                { className: style.root },
                new Ribbon(this.ribbonContent),
                div(
                    { className: style.content },
                    this._sidebarEl,
                    this._viewportContainer,
                    this._aiChatPanel,
                ),
                new Statusbar(style.statusbar),
            ),
        );
        this.app.mainWindow?.appendChild(this);
    }

    private _startSidebarResize(e: MouseEvent) {
        e.preventDefault();
        this._isResizingSidebar = true;
        if (this.app.mainWindow) this.app.mainWindow.style.cursor = "ew-resize";
        const onMouseMove = (ev: MouseEvent) => {
            if (!this._isResizingSidebar) return;
            if (!this._sidebarEl) return;
            const sidebarRect = this._sidebarEl.getBoundingClientRect();
            let newWidth = ev.clientX - sidebarRect.left;
            const minWidth = 75;
            const maxWidth = Math.floor(window.innerWidth * 0.85);
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            this._sidebarWidth = newWidth;
            this._sidebarEl.style.width = `${newWidth}px`;
        };
        const onMouseUp = () => {
            this._isResizingSidebar = false;
            if (this.app.mainWindow) this.app.mainWindow.style.cursor = "";
            this.app.mainWindow?.removeEventListener("mousemove", onMouseMove);
            this.app.mainWindow?.removeEventListener("mouseup", onMouseUp);
        };
        this.app.mainWindow?.addEventListener("mousemove", onMouseMove);
        this.app.mainWindow?.addEventListener("mouseup", onMouseUp);
    }

    connectedCallback(): void {
        PubSub.default.sub("showSelectionControl", this.showSelectionControl);
        PubSub.default.sub("editMaterial", this._handleMaterialEdit);
        PubSub.default.sub("clearSelectionControl", this.clearSelectionControl);
        PubSub.default.sub("toggleLeftSidebar", this._toggleSidebar);
        PubSub.default.sub("toggleAIChat", this._toggleAIChat);
    }

    disconnectedCallback(): void {
        PubSub.default.remove("showSelectionControl", this.showSelectionControl);
        PubSub.default.remove("editMaterial", this._handleMaterialEdit);
        PubSub.default.remove("clearSelectionControl", this.clearSelectionControl);
        PubSub.default.remove("toggleLeftSidebar", this._toggleSidebar);
        PubSub.default.remove("toggleAIChat", this._toggleAIChat);
    }

    private readonly showSelectionControl = (controller: AsyncController) => {
        this._selectionController.setControl(controller);
        this._selectionController.style.visibility = "visible";
        this._selectionController.style.zIndex = "1000";
    };

    private readonly clearSelectionControl = () => {
        this._selectionController.setControl(undefined);
        this._selectionController.style.visibility = "hidden";
    };

    private readonly _handleMaterialEdit = (
        document: IDocument,
        editingMaterial: Material,
        callback: (material: Material) => void,
    ) => {
        const context = new MaterialDataContent(document, callback, editingMaterial);
        this._viewportContainer.append(new MaterialEditor(context));
    };

    registerRibbonCommand(tabName: I18nKeys, groupName: I18nKeys, command: CommandKeys | Button) {
        const tab = this.ribbonContent.ribbonTabs.find((p) => p.tabName === tabName);
        const group = tab?.groups.find((p) => p.groupName === groupName);
        group?.items.push(command);
    }

    private readonly _toggleSidebar = () => {
        this._isSidebarVisible = !this._isSidebarVisible;
        if (this._sidebarEl) {
            this._sidebarEl.style.display = this._isSidebarVisible ? "flex" : "none";
        }
    };

    private readonly _toggleAIChat = () => {
        this._isAIChatVisible = !this._isAIChatVisible;
        if (this._aiChatPanel) {
            this._aiChatPanel.style.display = this._isAIChatVisible ? "flex" : "none";
        }
    };
}

customElements.define("chili-editor", Editor);
