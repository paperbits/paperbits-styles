import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import * as _ from "lodash";
import template from "./styleGuide.html";
import { Bag, MouseButtons } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { Component, OnDestroyed, OnMounted } from "@paperbits/common/ko/decorators";
import { Styleable } from "../contracts/styleable";
import { IStyleGroup, PrimitiveContract, StyleCompiler, StyleManager, VariationContract } from "@paperbits/common/styles";
import { ActiveElement, IContextCommandSet, IHighlightConfig, View, ViewManager, ViewManagerMode } from "@paperbits/common/ui";
import { ColorContract, FontContract, LinearGradientContract, ShadowContract } from "../contracts";
import { ComponentStyle } from "../contracts/componentStyle";
import { OpenTypeFontGlyph } from "../openType";
import { StyleService } from "../styleService";
import { formatUnicode } from "../styleUitls";



export class ComponentCard {
    public name: string;
    public displayName: ko.Observable<string>;
    public backgroundClassName: ko.Observable<string>;
    public itemTemplate: string;

    public variationCards: ko.ObservableArray<ComponentVariationCard>;

    constructor(public componentStyle: ComponentStyle) {
        this.itemTemplate = componentStyle.itemTemplate;
        this.name = componentStyle.name;
        this.displayName = ko.observable(componentStyle.displayName);
        this.backgroundClassName = ko.observable(null);

        const self = this;

        const variationCards = componentStyle.variations.map(variation => new ComponentVariationCard(self, variation));
        this.variationCards = ko.observableArray(variationCards);
    }
}

export class ComponentVariationCard {
    private mode = 1;
    public displayName: ko.Observable<string>;
    public backgroundClassName: ko.Observable<string>;
    public key: string;

    constructor(private component: ComponentCard, public variation: VariationContract) {
        this.displayName = ko.observable(variation.displayName);
        this.backgroundClassName = ko.observable(null);
        this.key = variation.key;
    }

    public toggleBackground = () => {
        switch (this.mode) {
            case 0:
                this.backgroundClassName(null);
                this.mode = 1;
                break;

            case 1:
                this.backgroundClassName("transparent");
                this.mode = 2;
                break;

            case 2:
                this.backgroundClassName("dark");
                this.mode = 0;
                break;
        }

        console.log(this.backgroundClassName());
    };

    public delete(): void {
        this.component.variationCards.remove(this);
    }
}

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

    public readonly working: ko.Observable<boolean>;

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
    public readonly uiComponents: ko.ObservableArray<ComponentCard>;

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

        this.working = ko.observable(true);
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

                        this.refreshFonts();
                        this.rebuildStyleSheet();

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

                                        this.refreshFonts();
                                        this.rebuildStyleSheet();
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

    public async removeStyle(contract: PrimitiveContract): Promise<void> {
        await this.styleService.removeStyle(contract.key);

        if (contract.key.startsWith("components/")) {
        }
        else {
            this.refreshComponents();
            this.refreshFonts();
            this.rebuildStyleSheet();
        }

        this.viewManager.notifySuccess("Styles", `Style "${contract.displayName}" was deleted.`);
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

                        this.refreshIcons();
                        this.rebuildStyleSheet();
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

    public async removeColor(style: PrimitiveContract): Promise<void> {
        await this.styleService.removeStyle(style.key);

        this.refreshColors();
        this.rebuildStyleSheet();
        this.viewManager.notifySuccess("Styles", `Color "${style.displayName}" was deleted.`);
    }

    public async removeGradient(style: PrimitiveContract): Promise<void> {
        await this.styleService.removeStyle(style.key);

        this.refreshGradients();
        this.rebuildStyleSheet();
        this.viewManager.notifySuccess("Styles", `Gradient "${style.displayName}" was deleted.`);
    }

    public async removeIcon(style: PrimitiveContract): Promise<void> {
        await this.styleService.removeStyle(style.key);

        this.refreshIcons();
        this.rebuildStyleSheet();
        this.viewManager.notifySuccess("Styles", `Icon "${style.displayName}" was deleted.`);
    }

    public async removeShadow(style: PrimitiveContract): Promise<void> {
        await this.styleService.removeStyle(style.key);

        this.refreshShadows();
        this.rebuildStyleSheet();
        this.viewManager.notifySuccess("Styles", `Shadow "${style.displayName}" was deleted.`);
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

                        this.refreshColors();
                        this.rebuildStyleSheet();
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

                        this.refreshGradients();
                        this.rebuildStyleSheet();
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

                        this.refreshShadows();
                        this.rebuildStyleSheet();
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectComponent(variationCard: ComponentVariationCard): boolean {
        const view: View = {
            heading: variationCard.variation.displayName,
            component: {
                name: "style-editor",
                params: {
                    elementStyle: variationCard.variation,
                    onUpdate: async () => {
                        await this.styleService.updateStyle(variationCard.variation);

                        this.refreshTextVariations();
                        this.rebuildStyleSheet();
                    },
                    onRename: () => {
                        this.refreshComponents();
                    }
                }
            },
            resizing: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectTextStyle(style: VariationContract): boolean {
        const view: View = {
            heading: style.displayName,
            component: {
                name: "style-editor",
                params: {
                    elementStyle: style,
                    onUpdate: async () => {
                        await this.styleService.updateStyle(style);

                        this.refreshTextVariations();
                        this.rebuildStyleSheet();
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

        this.selectTextStyle(addedItem);
    }

    public async addComponentVariation(componentName: string, componentCard?: ComponentCard): Promise<void> {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        let defaultVariation = componentCard.componentStyle.variations.find(x => x.key === `components/${componentName}/default`);

        if (!defaultVariation) {
            throw new Error(`Default variation for component "${componentName}" not found.`);
        }

        defaultVariation = Objects.clone(defaultVariation); // dropping references
        const addedStyleKey = await this.styleService.addComponentVariation(componentName, variationName, defaultVariation);
        const addedVariation = await this.styleService.getStyleByKey(addedStyleKey);

        const variationCard = new ComponentVariationCard(componentCard, addedVariation);
        componentCard.variationCards.push(variationCard);

        this.selectComponent(variationCard);
    }

    public async applyChanges(): Promise<void> {
        this.refreshColors();
        this.refreshGradients();
        this.refreshShadows();
        this.refreshIcons();
        this.refreshTextVariations();
        this.refreshComponents();

        this.rebuildStyleSheet();
    }

    private async rebuildStyleSheet(): Promise<void> {
        const styleManager = new StyleManager(this.eventManager);
        const styleSheet = await this.styleCompiler.getStyleSheet();
        styleManager.setStyleSheet(styleSheet);
    }


    private async refreshFonts(): Promise<void> {
        const fonts = await this.styleService.getFonts();
        this.fonts([]);
        this.fonts(fonts.filter(x => x.key !== "fonts/icons"));
    }

    private async refreshColors(): Promise<void> {
        const colors = await this.styleService.getColors();
        this.colors([]);
        this.colors(this.sortByDisplayName(colors));
    }

    private async refreshGradients(): Promise<void> {
        const gradients = await this.styleService.getGadients();
        this.gradients([]);
        this.gradients(this.sortByDisplayName(gradients));
    }

    private async refreshShadows(): Promise<void> {
        const shadows = await this.styleService.getShadows();
        this.shadows([]);
        this.shadows(shadows);
    }

    private async refreshIcons(): Promise<void> {
        const icons = await this.styleService.getIcons();

        const extendedIcons = icons.map(icon => ({
            key: icon.key,
            class: Utils.camelCaseToKebabCase(icon.key.replace("icons/", "icon-")),
            displayName: icon.displayName,
            unicode: formatUnicode(icon.unicode)
        }));

        this.icons(extendedIcons);
    }

    private async refreshTextVariations(): Promise<void> {
        const textVariations = await this.styleService.getTextVariations();
        this.textStyles([]);
        this.textStyles(textVariations);
    }

    private async refreshComponents(): Promise<void> {
        const components = await this.getComponentsStyles();
        this.uiComponents(components.map(x => new ComponentCard(x)));
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
    public async initialize(): Promise<void> {
        this.viewManager.mode = ViewManagerMode.selecting;
        this.ownerDocument = this.viewManager.getHostDocument();
        this.ownerDocument.addEventListener(Events.MouseMove, this.onPointerMove, true);
        this.ownerDocument.addEventListener(Events.Scroll, this.onWindowScroll);
        this.ownerDocument.addEventListener(Events.MouseDown, this.onPointerDown, true);

        this.eventManager.dispatchEvent(Events.HintRequest, {
            key: "7b92",
            content: `<p>Here you can manage styles of every element of the content. All the customizations will get reflected everywhere on your website.</p><p>Press Escape button to get back to the page editing.</p>`
        });

        this.refreshColors();
        this.refreshFonts();
        this.refreshGradients();
        this.refreshShadows();
        this.refreshIcons();
        this.refreshTextVariations();
        this.refreshComponents();

        this.working(false);
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

        const styleCategory = style.key.split("/")[0];

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

                            this.refreshIcons();
                            this.rebuildStyleSheet();

                            this.viewManager.clearContextualCommands();
                            this.viewManager.notifySuccess("Styles", `Icon "${style.displayName}" was deleted.`);
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
                name: "edit",
                controlType: "toolbox-button",
                displayName: "Edit shadow",
                position: "top right",
                callback: () => this.selectShadow(<ShadowContract>style)
            });
        }

        if (style.key.startsWith("gradients/")) {
            styleContextualEditor.selectCommands.push({
                name: "edit",
                controlType: "toolbox-button",
                displayName: "Edit gradient",
                position: "top right",
                callback: () => this.selectGradient(style)
            });
        }

        if (style.key.startsWith("colors/")) {
            styleContextualEditor.selectCommands.push({
                name: "edit",
                controlType: "toolbox-button",
                displayName: "Edit color",
                position: "top right",
                callback: () => this.selectColor(style)
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
                                    this.refreshFonts();
                                    this.rebuildStyleSheet();
                                }
                            }
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });
        }

        const getDisplayName = ko.computed(() => {
            return styleable.state()
                ? `Edit style (:${styleable.state()})`
                : `Edit style`
        });

        if (style.key.startsWith("components/")) {
            styleContextualEditor.selectCommands.push({
                name: "edit",
                controlType: "toolbox-button",
                displayName: getDisplayName,
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
                                    this.rebuildStyleSheet();
                                },
                                currentState: styleable.state(),
                                onStateChange: (state: string): void => {
                                    styleable.setState(state);
                                    this.rebuildStyleSheet();
                                },
                                onRename: () => {
                                    this.refreshComponents();
                                }
                            }
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });

            if (style["allowedStates"]?.length > 1) {
                styleContextualEditor.selectCommands.push({
                    tooltip: "Select state",
                    iconClass: "paperbits-icon paperbits-small-down",
                    controlType: "toolbox-dropdown",
                    component: {
                        name: "state-selector",
                        params: {
                            states: style["allowedStates"],
                            selectedState: styleable.state,
                            onSelect: (state: string): void => {
                                styleable.setState(state);
                            }
                        }
                    }
                });
            }
        }

        if (style.key.startsWith("globals/")) {
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
                                    this.rebuildStyleSheet();
                                },
                                onRename: () => {
                                    this.refreshTextVariations();
                                }
                            }
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });
        }

        if (!style.key.startsWith("colors/") &&
            !style.key.startsWith("icons/") &&
            !style.key.startsWith("fonts/") &&
            !style.key.startsWith("shadows/") &&
            !style.key.startsWith("gradients/") &&
            !style.key.includes("/components/") // sub-components
        ) {
            styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });

            styleContextualEditor.selectCommands.push({
                name: "background",
                controlType: "toolbox-button",
                tooltip: "Change background",
                iconClass: "paperbits-icon paperbits-drop",
                position: "top right",
                color: "#607d8b",
                callback: () => styleable.toggleBackground()
            });
        }

        if (this.canBeDeleted(style.key)) {
            if (styleContextualEditor.selectCommands.length == 1) {
                styleContextualEditor.selectCommands.push({ controlType: "toolbox-splitter" });
            }

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
                            this.viewManager.clearContextualCommands();

                            switch (styleCategory) {
                                case "colors":
                                    this.removeColor(style);
                                    break;
                                case "gradients":
                                    this.removeGradient(style);
                                    break;
                                case "icons":
                                    this.removeIcon(style);

                                    break;
                                case "shadows":
                                    this.removeShadow(style);
                                    break;
                                default:
                                    this.removeStyle(style);
                            }

                            if (styleable.variationCard.delete) {
                                styleable.variationCard.delete();
                            }
                        },
                        onDecline: () => {
                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            };
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