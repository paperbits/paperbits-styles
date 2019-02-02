import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import * as _ from "lodash";
import template from "./styleGuide.html";
import { IEventManager } from "@paperbits/common/events";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { IComponent, IView, IViewManager, ViewManagerMode, IHighlightConfig, IContextualEditor, ISplitterConfig } from "@paperbits/common/ui";
import { StyleService } from "../styleService";
import { FontContract, ColorContract } from "../contracts";

export interface ElementStyle {
    key: string;
    style: any;
}

@Component({
    selector: "living-style-guide",
    template: template,
    injectable: "styleGuide"
})
export class StyleGuide {
    public styles: KnockoutObservable<any>;
    public textBlocks: KnockoutObservableArray<any>;
    public buttons: KnockoutObservableArray<any>;
    public cards: KnockoutObservableArray<any>;
    public fonts: KnockoutObservableArray<FontContract>;
    public colors: KnockoutObservableArray<ColorContract>;
    public bodyFontDisplayName: KnockoutObservable<string>;

    constructor(
        private readonly styleService: StyleService,
        private readonly viewManager: IViewManager,
        private readonly eventManager: IEventManager
    ) {
        this.loadStyles = this.loadStyles.bind(this);
        this.addButtonVariation = this.addButtonVariation.bind(this);
        this.addCardVariation = this.addCardVariation.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
        this.selectColor = this.selectColor.bind(this);
        this.removeStyle = this.removeStyle.bind(this);
        this.addFonts = this.addFonts.bind(this);
        this.addColor = this.addColor.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);

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
            heading: "Google fonts",
            component: {
                name: "google-fonts",
                params: {
                    onSelect: () => {
                        this.viewManager.closeWidgetEditor();
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
            heading: "Color editor",
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
    }

    public async applyChanges(): Promise<void> {
        const styles = await this.styleService.getStyles();

        const bodyFont = Utils.getObjectAt<FontContract>(styles.globals.body.typography.fontKey, styles);

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

    private isModelSelected(binding): boolean {
        // const selectedElement = this.viewManager.getSelectedElement();

        // if (!selectedElement) {
        //     return false;
        // }

        // const selectedBinding = GridHelper.getWidgetBinding(selectedElement.element);

        // if (binding !== selectedBinding) {
        //     return false;
        // }

        // return true;

        return false;
    }

    private isModelBeingEdited(binding): boolean {
        // const view = this.viewManager.getOpenView();

        // if (!view) {
        //     return false;
        // }

        // if (view.component.name !== binding.editor) {
        //     return false;
        // }

        // return true;

        return false;
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

        const style = element["stylable"].style;

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
            const contextualEditor = this.getContextualEditor(style);

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
            this.selectedContextualEditor = contextualEditor;
        }
    }



    private activeHighlightedElement: HTMLElement;
    private scrolling: boolean;
    private scrollTimeout: any;
    private pointerX: number;
    private pointerY: number;
    private selectedContextualEditor: IContextualEditor;
    private actives: object = {};
    private ownerDocument: Document;
    private selectedStyle;

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

        // switch (this.viewManager.mode) {
        //     case ViewManagerMode.selecting:
        //     case ViewManagerMode.selected:
        //         this.renderHighlightedElements();
        //         break;

        //     case ViewManagerMode.dragging:
        //         this.renderDropHandlers();

        //         break;
        // }
    }


    private getContextualEditor(style): IContextualEditor {
        const styleContextualEditor: IContextualEditor = {
            color: "#607d8b",
            deleteCommand: null,
            selectionCommands: []
        };

        if (!style.key.startsWith("globals/") &&
            !style.key.startsWith("components/formControl/default") &&
            !style.key.startsWith("components/navbar/default")
        ) {
            styleContextualEditor.deleteCommand = {
                tooltip: "Delete variation",
                color: "#607d8b",
                callback: () => {
                    this.removeStyle(style);
                    this.viewManager.clearContextualEditors();
                }
            };
        }

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
        } else {
            if (!style.key.startsWith("fonts/")) {
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
            const contextualEditor = this.getContextualEditor(style);

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