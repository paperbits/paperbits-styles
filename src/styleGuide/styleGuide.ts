import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import * as _ from "lodash";
import template from "./styleGuide.html";
import { Bag, MouseButtons } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { Component, OnDestroyed, OnMounted } from "@paperbits/common/ko/decorators";
import { IStyleGroup, Styleable, StyleCompiler, StyleManager, VariationContract } from "@paperbits/common/styles";
import { ActiveElement, IContextCommandSet, IHighlightConfig, View, ViewManager, ViewManagerMode } from "@paperbits/common/ui";
import { ColorContract, FontContract, LinearGradientContract, ShadowContract } from "../contracts";
import { ComponentStyle } from "../contracts/componentStyle";
import { StyleItem } from "../models/styleItem";
import { OpenTypeFontGlyph } from "../openType";
import { StyleService } from "../styleService";
import { formatUnicode } from "../styleUitls";

@Component({
    selector: "style-guide",
    template: template
})
export class StyleGuide {
    private activeHighlightedElement: HTMLElement;
    private scrolling: boolean;
    private scrollTimeout: any;
    private pointerX: number;
    private pointerY: number;
    private activeElements: Bag<ActiveElement>;
    private ownerDocument: Document;

    public readonly styles: ko.Observable<any>;
    public readonly textBlocks: ko.ObservableArray<any>;
    public readonly buttons: ko.ObservableArray<any>;
    public readonly cards: ko.ObservableArray<any>;
    public readonly pictures: ko.ObservableArray<any>;
    public readonly videoPlayers: ko.ObservableArray<any>;
    public readonly fonts: ko.ObservableArray<FontContract>;
    public readonly colors: ko.ObservableArray<ColorContract>;
    public readonly shadows: ko.ObservableArray<ShadowContract>;
    public readonly gradients: ko.ObservableArray<LinearGradientContract>;
    public readonly icons: ko.ObservableArray<any>;
    public readonly textStyles: ko.ObservableArray<any>;
    public readonly navBars: ko.ObservableArray<any>;
    public readonly uiComponents: ko.ObservableArray<ComponentStyle>;

    constructor(
        private readonly styleService: StyleService,
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager,
        private readonly styleGroups: IStyleGroup[],
        private readonly styleCompiler: StyleCompiler
    ) {
        this.renderContextualCommands = this.renderContextualCommands.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.initialize = this.initialize.bind(this);
        this.dispose = this.dispose.bind(this);
        // this.onDelete = this.onDelete.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onWindowScroll = this.onWindowScroll.bind(this);
        // this.onKeyDown = this.onKeyDown.bind(this);

        this.styles = ko.observable();
        this.colors = ko.observableArray([]);
        this.shadows = ko.observableArray([]);
        this.gradients = ko.observableArray([]);
        this.icons = ko.observableArray([]);
        this.fonts = ko.observableArray([]);
        this.buttons = ko.observableArray([]);
        this.cards = ko.observableArray([]);
        this.pictures = ko.observableArray([]);
        this.videoPlayers = ko.observableArray([]);
        this.textBlocks = ko.observableArray([]);
        this.textStyles = ko.observableArray([]);
        this.navBars = ko.observableArray([]);
        this.uiComponents = ko.observableArray([]);

        this.activeElements = {};
    }

    public addFonts(): void {
        const view: View = {
            heading: "Fonts",
            component: {
                name: "google-fonts",
                params: {
                    onSelect: async (font: FontContract, custom: boolean) => {
                        this.viewManager.closeView();
                        await this.applyChanges();

                        if (!custom) {
                            return;
                        }

                        const view: View = {
                            heading: font.displayName,
                            component: {
                                name: "font-editor",
                                params: {
                                    font: font,
                                    onChange: async () => {
                                        await this.styleService.updateStyle(font);
                                        this.applyChanges();
                                    }
                                }
                            },
                            resizing: "vertically horizontally"
                        };

                        this.viewManager.openViewAsPopup(view);
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async removeStyle(contract: VariationContract): Promise<void> {
        await this.styleService.removeStyle(contract.key);
        if (contract.key.startsWith("components/")) {
            const parts = contract.key.split("/");
            const componentName = parts[1];
            await this.onUpdateStyle(componentName);
        } else {
            this.applyChanges();
        }
    }

    public async addColor(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedItem = await this.styleService.addColorVariation(variationName);

        const colors = this.colors();
        colors.push(addedItem);
        this.colors(this.sortByDisplayName(colors));

        this.selectColor(addedItem);
    }

    public async addGradient(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedItem = await this.styleService.addGradientVariation(variationName);

        const gradients = this.gradients();
        gradients.push(addedItem);
        this.gradients(this.sortByDisplayName(gradients));

        this.selectGradient(addedItem);
    }

    public async addShadow(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedItem = await this.styleService.addShadowVariation(variationName);

        const shadows = this.shadows();
        shadows.push(addedItem);
        this.shadows(this.sortByDisplayName(shadows));

        this.selectShadow(addedItem);
    }

    public async addIcon(): Promise<void> {
        const externalFonts = await this.styleService.getExternalIconFonts();

        const view: View = {
            heading: "Add icon",
            component: {
                name: "glyph-import",
                params: {
                    fonts: externalFonts,
                    showFontNames: true,
                    onSelect: async (glyph: OpenTypeFontGlyph) => {
                        await this.styleService.addIcon(glyph);
                        this.viewManager.closeView();
                        this.applyChanges();
                    }
                }
            },
            resizing: {
                directions: "vertically horizontally",
                initialWidth: 400
            }
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async removeColor(color: ColorContract): Promise<void> {
        await this.styleService.removeStyle(color.key);
        this.applyChanges();
    }

    public async removeGradient(gradient: LinearGradientContract): Promise<void> {
        await this.styleService.removeStyle(gradient.key);
        this.applyChanges();
    }

    public selectColor(color: ColorContract): boolean {
        const view: View = {
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
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectGradient(gradient: LinearGradientContract): boolean {
        const view: View = {
            heading: "Gradient",
            component: {
                name: "gradient-editor",
                params: {
                    selectedGradient: gradient,
                    onSelect: async (gradient: LinearGradientContract) => {
                        await this.styleService.updateStyle(gradient);
                        this.applyChanges();
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);

        return true;
    }

    public selectShadow(shadow: ShadowContract): boolean {
        const view: View = {
            heading: "Shadow",
            component: {
                name: "shadow-editor",
                params: {
                    selectedShadow: shadow,
                    onSelect: async (shadow: ShadowContract) => {
                        await this.styleService.updateStyle(shadow);
                        this.applyChanges();
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectStyle(style: VariationContract): boolean {
        const view: View = {
            heading: style.displayName,
            component: {
                name: "style-editor",
                params: {
                    elementStyle: style,
                    onUpdate: async () => {
                        await this.styleService.updateStyle(style);

                        if (style.key.startsWith("components/")) {
                            const parts = style.key.split("/");
                            const componentName = parts[1];

                            await this.onUpdateStyle(componentName);
                        }

                        this.applyChanges();
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public async addTextStyleVariation(): Promise<void> {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        const addedItem = await this.styleService.addTextStyleVariation(variationName);

        const textStyles = this.textStyles();
        textStyles.push(addedItem);
        this.textStyles(this.sortByDisplayName(textStyles));

        this.selectStyle(addedItem);
    }

    public async onSnippetSelected(snippet: StyleItem): Promise<void> {
        await this.styleService.mergeStyles(snippet.stylesConfig);
        await this.openInEditor(snippet.stylesType.split("/").pop(), snippet);
    }

    public async openInEditor(componentName: string, snippet?: any): Promise<void> {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        const addedStyleKey = await this.styleService.addComponentVariation(componentName, variationName, snippet);
        const addedStyle = await this.styleService.getStyleByKey(addedStyleKey);

        this.selectStyle(addedStyle);

        await this.onUpdateStyle(componentName);
    }

    private async onUpdateStyle(componentName: string): Promise<void> {
        const components = this.uiComponents();
        const old = components.find(c => c.name === componentName);

        if (old) {
            const updated = await this.getComponentsStyles();
            const updatedItem = updated.find(c => c.name === componentName);
            this.uiComponents.replace(old, updatedItem);
        }
    }

    public async applyChanges(): Promise<void> {
        const styles = await this.styleService.getStyles();

        const fonts = await this.styleService.getFonts();
        this.fonts(fonts.filter(x => x.key !== "fonts/icons"));

        const colors = await this.styleService.getColors();
        this.colors(this.sortByDisplayName(colors));

        const gradients = await this.styleService.getGadients();
        this.gradients(this.sortByDisplayName(gradients));

        const shadows = await this.styleService.getShadows();
        this.shadows(shadows);

        const icons = await this.styleService.getIcons();
        const extendedIcons = icons.map(icon => ({
            key: icon.key,
            class: Utils.camelCaseToKebabCase(icon.key.replace("icons/", "icon-")),
            displayName: icon.displayName,
            unicode: formatUnicode(icon.unicode)
        }));

        this.icons(extendedIcons);

        const textVariations = await this.styleService.getTextVariations();
        this.textStyles(textVariations);

        const components = await this.getComponentsStyles();
        this.uiComponents(components);

        this.styles(styles);

        const styleManager = new StyleManager(this.eventManager);
        const styleSheet = await this.styleCompiler.getStyleSheet();
        styleManager.setStyleSheet(styleSheet);
    }

    public async getComponentsStyles(): Promise<ComponentStyle[]> {
        const styles = await this.styleService.getStyles();

        const result = Object.keys(styles.components)
            .map<ComponentStyle>(componentName => {
                const groupMetadata = this.styleGroups.find(item => item.name === `components_${componentName}`);

                if (!groupMetadata || !groupMetadata.styleTemplate) {
                    // console.warn("metadata not found for component:", componentName);
                    return undefined;
                }

                const componentStyles = styles.components[componentName];
                const states = this.styleService.getAllowedStates(componentStyles);

                const variations = Object.keys(componentStyles).map(variationName => {
                    const variationContract = componentStyles[variationName];

                    if (!variationContract) {
                        return null;
                    }

                    if (states && variationName !== "default") {
                        variationContract.allowedStates = states;
                    }

                    return variationContract;
                });

                return {
                    name: componentName,
                    displayName: groupMetadata.groupName,
                    variations: variations.filter(x => !!x),
                    itemTemplate: groupMetadata.styleTemplate
                };
            })
            .filter(item => item !== undefined);

        return result;
    }

    private sortByDisplayName(items: any[]): any[] {
        return _.sortBy(items, ["displayName"]);
    }

    public keyToClass(key: string): string {
        return Utils.camelCaseToKebabCase(key).replace("/", "-");
    }







    @OnMounted()
    public initialize(): void {
        this.viewManager.mode = ViewManagerMode.selecting;
        this.applyChanges();
        this.ownerDocument = this.viewManager.getHostDocument();
        this.ownerDocument.addEventListener(Events.MouseMove, this.onPointerMove, true);
        this.ownerDocument.addEventListener(Events.Scroll, this.onWindowScroll);
        this.ownerDocument.addEventListener(Events.MouseDown, this.onPointerDown, true);

        this.eventManager.dispatchEvent("displayHint", {
            key: "7b92",
            content: `<p>Here you can manage styles of every element of the content. All the customizations will get reflected everywhere on your website.</p><p>Press Escape button to get back to the page editing.</p>`
        });
    }

    @OnDestroyed()
    public dispose(): void {
        this.ownerDocument.removeEventListener(Events.MouseMove, this.onPointerMove, true);
        this.ownerDocument.removeEventListener(Events.Scroll, this.onWindowScroll);
        this.ownerDocument.removeEventListener(Events.MouseDown, this.onPointerDown, true);
    }

    private onWindowScroll(): void {
        if (this.viewManager.mode === ViewManagerMode.dragging || this.viewManager.mode === ViewManagerMode.pause) {
            return;
        }

        if (!this.scrolling) {
            this.viewManager.clearContextualCommands();
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
        if (this.scrolling) {
            return;
        }

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        this.renderContextualCommands(elements);
    }

    private isStyleSelectable(contextualEditor: IContextCommandSet): boolean {
        if (!contextualEditor) {
            return false;
        }

        return contextualEditor.selectCommands.concat(contextualEditor.deleteCommand).length > 0;
    }

    private onPointerDown(event: MouseEvent): void {
        if (this.viewManager.mode === ViewManagerMode.pause) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.button !== MouseButtons.Main) {
            return;
        }

        if (this.viewManager.mode !== ViewManagerMode.selecting &&
            this.viewManager.mode !== ViewManagerMode.selected &&
            this.viewManager.mode !== ViewManagerMode.configure) {
            return;
        }

        const element = this.activeHighlightedElement;

        if (!element) {
            return;
        }

        const styleable: Styleable = element["styleable"];

        if (!styleable) {
            return;
        }

        const style = styleable.style;

        if (!style) {
            return;
        }

        const selectedElement = this.viewManager.getSelectedElement();

        if (selectedElement && selectedElement.element === element) {
            const contextualEditor = this.getContextCommands(element, styleable);
            const editCommand = contextualEditor.selectCommands.find(command => command.name === "edit");

            if (editCommand) {
                editCommand.callback();
            }
            return;
        }

        const contextualEditor = this.getContextCommands(element, styleable);

        if (!this.isStyleSelectable(contextualEditor)) {
            return;
        }

        const config: IHighlightConfig = {
            element: element,
            text: style.displayName,
            color: contextualEditor.color
        };

        this.viewManager.setSelectedElement(config, contextualEditor);
    }

    private onPointerMove(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.pointerX = event.clientX;
        this.pointerY = event.clientY;

        this.renderHighlightedElements();
    }

    private canBeDeleted(styleKey: string): boolean {
        return (!styleKey.startsWith("globals/") || styleKey.startsWith("globals/body/")) &&
            !styleKey.endsWith("/default") &&
            !styleKey.includes("/components/") &&
            styleKey.indexOf("/navbar/default/") === -1 &&
            styleKey !== "colors/defaultBg";
    }

    private getContextCommands(element: HTMLElement, styleable: Styleable): IContextCommandSet {
        const style = styleable.style;

        const styleContextualEditor: IContextCommandSet = {
            color: "#607d8b",
            deleteCommand: null,
            selectCommands: [],
            element: element
        };

        if (this.canBeDeleted(style.key)) {
            styleContextualEditor.deleteCommand = {
                controlType: "toolbox-button",
                tooltip: "Delete",
                color: "#607d8b",
                doNotClearSelection: true,
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
                        onConfirm: () => {
                            this.removeStyle(style);
                            this.viewManager.clearContextualCommands();
                            this.viewManager.notifySuccess("Styles", `Style "${style.displayName}" was deleted.`);
                        },
                        onDecline: () => {
                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            };
        }

        if (style.key.startsWith("icons/")) {
            styleContextualEditor.deleteCommand = {
                controlType: "toolbox-button",
                tooltip: "Delete icon",
                color: "#607d8b",
                doNotClearSelection: true,
                component: {
                    name: "confirmation",
                    params: {
                        getMessage: async () => {
                            return `Are you sure you want to delete this icon?`;
                        },
                        onConfirm: async () => {
                            await this.styleService.removeIcon(style.key);
                            await this.applyChanges();
                            this.viewManager.clearContextualCommands();
                            this.viewManager.notifySuccess("Styles", `Style "${style.displayName}" was deleted.`);
                        },
                        onDecline: () => {
                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            };
        }

        if (style.key.startsWith("shadows/")) {
            styleContextualEditor.selectCommands.push({
                controlType: "toolbox-button",
                displayName: "Edit shadow",
                position: "top right",
                callback: () => this.selectShadow(<ShadowContract>style)
            });
            styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });
        }

        if (style.key.startsWith("gradients/")) {
            styleContextualEditor.selectCommands.push({
                controlType: "toolbox-button",
                displayName: "Edit gradient",
                position: "top right",
                callback: () => this.selectGradient(style)
            });
            styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });
        }

        if (style.key.startsWith("colors/")) {
            styleContextualEditor.selectCommands.push({
                controlType: "toolbox-button",
                displayName: "Edit color",
                position: "top right",
                callback: () => this.selectColor(style)
            });
            styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });
        }

        if (style.key.startsWith("components/") || style.key.startsWith("globals/")) {
            styleContextualEditor.selectCommands.push({
                name: "edit",
                controlType: "toolbox-button",
                displayName: "Edit style",
                // iconClass: "paperbits-icon paperbits-edit-72",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    const view: View = {
                        heading: style.displayName,
                        component: {
                            name: "style-editor",
                            params: {
                                elementStyle: style,
                                onUpdate: async () => {
                                    await this.styleService.updateStyle(style);

                                    if (style.key.startsWith("components/")) {
                                        const parts = style.key.split("/");
                                        const componentName = parts[1];
                                        await this.onUpdateStyle(componentName);
                                    }

                                    this.applyChanges();
                                }
                            }
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });

            styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });
        }

        if (!style.key.startsWith("colors/") &&
            !style.key.startsWith("icons/") &&
            !style.key.startsWith("fonts/") &&
            !style.key.startsWith("shadows/") &&
            !style.key.startsWith("gradients/") &&
            !style.key.includes("/components/") // sub-components
        ) {
            styleContextualEditor.selectCommands.push({
                name: "background",
                controlType: "toolbox-button",
                tooltip: "Change background",
                iconClass: "paperbits-icon paperbits-drop",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    styleable.toggleBackground();
                }
            });
        }

        if (style.key.startsWith("fonts/")) {
            styleContextualEditor.selectCommands.push({
                name: "edit",
                controlType: "toolbox-button",
                displayName: "Edit font",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    const view: View = {
                        heading: style.displayName,
                        component: {
                            name: "font-editor",
                            params: {
                                font: style,
                                onChange: async () => {
                                    await this.styleService.updateStyle(style);
                                    this.applyChanges();
                                }
                            }
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });
        }

        return styleContextualEditor;
    }

    private renderContextualCommands(elements: HTMLElement[]): void {
        let highlightedElement: HTMLElement;
        let highlightedText: string;
        let highlightColor: string;

        const tobeDeleted = Object.keys(this.activeElements);

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const styleable = element["styleable"];

            if (!styleable) {
                continue;
            }

            const style = styleable.style;

            const index = tobeDeleted.indexOf(style.key);
            tobeDeleted.splice(index, 1);

            highlightedElement = element;
            highlightedText = style.displayName;

            const active = this.activeElements[style.key];
            const contextualCommands = this.getContextCommands(element, styleable);

            highlightColor = contextualCommands.color;

            if (!active || element !== active.element) {
                this.viewManager.setContextualCommands(style.key, contextualCommands);

                this.activeElements[style.key] = {
                    key: style.key,
                    element: element
                };
            }
        }

        tobeDeleted.forEach(x => {
            this.viewManager.removeContextualCommands(x);
            delete this.activeElements[x];
        });

        if (this.activeHighlightedElement !== highlightedElement) {
            this.activeHighlightedElement = highlightedElement;
            this.viewManager.setHighlight({ element: highlightedElement, text: highlightedText, color: highlightColor });
        }
    }
}