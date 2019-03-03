import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import * as Objects from "@paperbits/common/objects";
import * as _ from "lodash";
import template from "./styleGuide.html";
import { IEventManager } from "@paperbits/common/events";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { IView, IViewManager, ViewManagerMode, IHighlightConfig, IContextCommandSet } from "@paperbits/common/ui";
import { StyleService } from "../styleService";
import { FontContract, ColorContract } from "../contracts";

export interface ElementStyle {
    key: string;
    style: any;
}

@Component({
    selector: "style-guide",
    template: template,
    injectable: "styleGuide"
})
export class StyleGuide {
    private activeHighlightedElement: HTMLElement;
    private scrolling: boolean;
    private scrollTimeout: any;
    private pointerX: number;
    private pointerY: number;
    private actives: object = {};
    private ownerDocument: Document;

    public styles: ko.Observable<any>;
    public textBlocks: ko.ObservableArray<any>;
    public buttons: ko.ObservableArray<any>;
    public cards: ko.ObservableArray<any>;
    public fonts: ko.ObservableArray<FontContract>;
    public colors: ko.ObservableArray<ColorContract>;
    public bodyFontDisplayName: ko.Observable<string>;

    constructor(
        private readonly styleService: StyleService,
        private readonly viewManager: IViewManager,
        private readonly eventManager: IEventManager
    ) {
        this.styles = ko.observable();
        this.colors = ko.observableArray();
        this.fonts = ko.observableArray([]);
        this.buttons = ko.observableArray([]);
        this.cards = ko.observableArray([]);
        this.textBlocks = ko.observableArray([]);
        this.bodyFontDisplayName = ko.observable();
    }

    @OnMounted()
    public async loadStyles(): Promise<void> {
        this.applyChanges();
        this.ownerDocument = this.viewManager.getHostDocument();
        this.attach();
    }

    public async addFonts(): Promise<void> {
        const view: IView = {
            heading: "Fonts",
            component: {
                name: "google-fonts",
                params: {
                    onSelect: () => {
                        this.viewManager.closeView();
                        this.eventManager.dispatchEvent("onStyleChange");
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async removeStyle(contract): Promise<void> {
        await this.styleService.removeStyle(contract.key);
        this.applyChanges();
    }

    public async addColor(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedColorKey = await this.styleService.addColorVariation(variationName);
        this.applyChanges();

        const color = await this.styleService.getColorByKey(addedColorKey);
        this.selectColor(color);
    }

    public async removeColor(color: ColorContract): Promise<void> {
        await this.styleService.removeStyle(color.key);
        this.applyChanges();
    }

    public selectColor(color: ColorContract): void {
        const view: IView = {
            heading: "Color",
            component: {
                name: "color-editor",
                params: {
                    selectedColor: color,
                    onSelect: async (color: ColorContract) => {
                        await this.styleService.updateStyle(color);
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public selectStyle(style: any): void {
        const view: IView = {
            heading: style.displayName,
            component: {
                name: "style-editor",
                params: {
                    elementStyle: style,
                    onUpdate: () => {
                        this.styleService.updateStyle(style);
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async addButtonVariation(): Promise<void> {
        await this.openInEditor("button");
    }

    public async addCardVariation(): Promise<void> {
        await this.openInEditor("card");
    }

    private async openInEditor(componentName: string) {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        const addedStyleKey = await this.styleService.addComponentVariation(componentName, variationName);
        const addedStyle = await this.styleService.getStyleByKey(addedStyleKey);
        this.selectStyle(addedStyle);

        this.applyChanges();
    }

    public async applyChanges(): Promise<void> {
        const styles = await this.styleService.getStyles();

        const bodyFont = Objects.getObjectAt<FontContract>(styles.globals.body.typography.fontKey, styles);

        if (bodyFont) {
            this.bodyFontDisplayName(bodyFont.displayName);
        }
        else {
            this.bodyFontDisplayName("Default");
        }

        const fonts = Object.keys(styles.fonts).map(key => styles.fonts[key]);
        this.fonts(fonts);

        const colors = Object.keys(styles.colors).map(key => styles.colors[key]);
        this.colors(this.sortByDisplayName(colors));

        const cardVariations = await this.styleService.getComponentVariations("card");
        this.cards(this.sortByDisplayName(cardVariations));

        const buttonVariations = await this.styleService.getComponentVariations("button");
        this.buttons(this.sortByDisplayName(buttonVariations));

        // this.styles.valueHasMutated();

        this.styles(styles);
    }

    private sortByDisplayName(items: any[]) {
        return _.sortBy(items, ["displayName"]);
    }

















    public attach(): void {
        // Firefox doesn't fire "mousemove" events by some reason
        this.ownerDocument.addEventListener("mousemove", this.onPointerMove.bind(this), true);
        this.ownerDocument.addEventListener("scroll", this.onWindowScroll.bind(this));
        this.ownerDocument.addEventListener("mousedown", this.onPointerDown, true);
        // this.ownerDocument.addEventListener("keydown", this.onKeyDown);
    }

    public dispose(): void {
        this.ownerDocument.removeEventListener("mousemove", this.onPointerMove.bind(this), true);
        this.ownerDocument.removeEventListener("scroll", this.onWindowScroll.bind(this));
        this.ownerDocument.removeEventListener("mousedown", this.onPointerDown, true);
        // this.ownerDocument.removeEventListener("keydown", this.onKeyDown);
    }

    private onWindowScroll(): void {
        if (this.viewManager.mode === ViewManagerMode.dragging || this.viewManager.mode === ViewManagerMode.pause) {
            return;
        }

        if (!this.scrolling) {
            this.viewManager.clearContextualEditors();
        }

        this.scrolling = true;

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(this.resetScrolling.bind(this), 400);
    }

    private resetScrolling(): void {
        this.scrolling = false;
        this.renderHighlightedElements();
    }

    private renderHighlightedElements(): void {
        if (this.scrolling || (this.viewManager.mode !== ViewManagerMode.selecting && this.viewManager.mode !== ViewManagerMode.selected)) {
            return;
        }

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        this.rerenderEditors(this.pointerX, this.pointerY, elements);
    }

    private onPointerDown(event: MouseEvent): void {
        if (this.viewManager.mode === ViewManagerMode.pause) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.button !== 0) {
            return;
        }

        if (this.viewManager.mode !== ViewManagerMode.selecting &&
            this.viewManager.mode !== ViewManagerMode.selected &&
            this.viewManager.mode !== ViewManagerMode.configure) {
            return;
        }

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        const element = elements.find(x => x["stylable"]);

        if (!element || !element["stylable"]) {
            return;
        }

        const stylable = element["stylable"];
        const style = stylable.style;

        if (!style) {
            return;
        }

        const selectedElement = this.viewManager.getSelectedElement();

        if (selectedElement && selectedElement.element === element) {
            if (style.key.startsWith("colors/")) {
                this.selectColor(style);
            }
            else if (style.key.startsWith("fonts/")) {
                // do nothing
            }
            else {
                this.selectStyle(style);
            }
        }
        else {
            const contextualEditor = this.getContextualEditor(stylable);

            if (!contextualEditor) {
                return;
            }

            const config: IHighlightConfig = {
                element: element,
                text: style["displayName"],
                color: contextualEditor.color
            };

            contextualEditor.element = element;

            this.viewManager.setSelectedElement(config, contextualEditor);
        }
    }

    private onPointerMove(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.pointerX = event.clientX;
        this.pointerY = event.clientY;

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        if (elements.length === 0) {
            return;
        }

        this.renderHighlightedElements();
    }


    private getContextualEditor(stylable): IContextCommandSet {
        const style = stylable.style;

        const styleContextualEditor: IContextCommandSet = {
            color: "#607d8b",
            deleteCommand: null,
            selectionCommands: []
        };

        if (!style.key.startsWith("globals/") &&
            style.key !== "colors/default" &&
            style.key !== "fonts/default" &&
            style.key !== "components/formControl/default" &&
            style.key !== "components/button/default" &&
            style.key !== "components/navbar/default" &&
            style.key !== "components/card/default"
        ) {
            styleContextualEditor.deleteCommand = {
                tooltip: "Delete variation",
                color: "#607d8b",
                component: {
                    name: "confirmation",
                    params: {
                        getMessage: async () => {
                            const references = await this.styleService.checkStyleIsInUse(style.key);
                            const styleNames = references.map(x => x.displayName).join(`", "`);

                            let message = `Are you sure you want to delete this style?`;

                            if (styleNames) {
                                message += ` It is referenced by "${styleNames}".`;
                            }

                            return message;
                        },
                        onConfirm: async () => {
                            this.removeStyle(style);
                            this.viewManager.clearContextualEditors();
                            this.viewManager.notifySuccess("Styles", `Style "${style.displayName}" was deleted.`);
                        },
                        onDecline: () => {
                            this.viewManager.clearContextualEditors();
                        }
                    }
                }
            };
        }

        styleContextualEditor.selectionCommands.push({
            tooltip: "Change background",
            iconClass: "paperbits-drop",
            position: "top right",
            color: "#607d8b",
            callback: () => {
                stylable.toggleBackground();
            }
        });

        if (style.key.startsWith("colors/")) {
            styleContextualEditor.selectionCommands.push({
                tooltip: "Edit variation",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    this.selectColor(style);
                }
            });
        }
        else if (!style.key.startsWith("fonts/")) {
            styleContextualEditor.selectionCommands.push({
                tooltip: "Edit variation",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    const view: IView = {
                        heading: style.displayName,
                        component: {
                            name: "style-editor",
                            params: {
                                elementStyle: style,
                                onUpdate: () => {
                                    this.styleService.updateStyle(style);
                                }
                            }
                        },
                        resize: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });
        }

        return styleContextualEditor;
    }

    private async rerenderEditors(pointerX: number, pointerY: number, elements: HTMLElement[]): Promise<void> {
        let highlightedElement: HTMLElement;
        let highlightedText: string;
        let highlightColor: string;
        const tobeDeleted = Object.keys(this.actives);

        let current = null;

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const stylable = element["stylable"];

            if (!stylable) {
                continue;
            }

            const style = stylable.style;

            const index = tobeDeleted.indexOf(style.key);
            tobeDeleted.splice(index, 1);

            highlightedElement = element;
            highlightedText = style.displayName;

            current = style;

            const active = this.actives[style.key];
            const contextualEditor = this.getContextualEditor(stylable);

            highlightColor = contextualEditor.color;

            if (!active || element !== active.element) {
                this.viewManager.setContextualEditor(style.key, contextualEditor);

                this.actives[style.key] = {
                    element: element
                };
            }
        }

        tobeDeleted.forEach(x => {
            this.viewManager.removeContextualEditor(x);
            delete this.actives[x];
        });

        if (this.activeHighlightedElement !== highlightedElement) {
            this.activeHighlightedElement = highlightedElement;
            this.viewManager.setHighlight({ element: highlightedElement, text: highlightedText, color: highlightColor });
        }
    }
}