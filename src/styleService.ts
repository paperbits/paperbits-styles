import * as _ from "lodash";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import * as Constants from "@paperbits/common/constants";
import { IObjectStorage } from "@paperbits/common/persistence";
import { ThemeContract, ColorContract, ShadowContract, LinearGradientContract, FontGlyphContract, FontContract } from "./contracts";
import { AnimationContract } from "./plugins";
import { ComponentStyle } from "./contracts/componentStyle";
import { ComponentStyleDefinition, LocalStyles, StyleDefinition, StyleHandler, VariationContract } from "@paperbits/common/styles";
import { StylePrimitives } from "./constants";
import { OpenTypeFontGlyph } from "./openType/openTypeFontGlyph";
import { FontManager } from "./openType";
import { HttpClient } from "@paperbits/common/http";
import { IWidgetHandler } from "@paperbits/common/editing";
import { components } from "knockout";
import { Bag } from "@paperbits/common";
import { StyleHelper } from "./styleHelper";


const stylesPath = "styles";

export class StyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly styleHandlers: StyleHandler[],
        private readonly widgetHandlers: IWidgetHandler[],
        private readonly fontManager: FontManager,
        private readonly httpClient: HttpClient
    ) { }

    private sortByDisplayName(items: any[]): any[] {
        return _.sortBy(items, ["displayName"]);
    }

    /**
     * Returns object with the whole theme styles.
     */
    public async getStyles(): Promise<ThemeContract> {
        const stylesObject = await this.objectStorage.getObject<ThemeContract>(stylesPath);

        if (!stylesObject) {
            throw new Error("Data doesn't contain styles.");
        }

        // this.styleHandlers.forEach(styleHandler => {
        //     if (styleHandler.migrate) {
        //         styleHandler.migrate(stylesObject.components[styleHandler.key]);
        //     }

        //     if (stylesObject.components[styleHandler.key]) {
        //         return;
        //     }

        //     stylesObject.components[styleHandler.key] = styleHandler.getDefaultStyle();
        // });

        return stylesObject;
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        styleKey = styleKey.trim();

        if (!StylePrimitives.some(x => styleKey.startsWith(`${x}/`))) {
            throw new Error(`Unknown style primitive: "${styleKey}".`);
        }

        const styles = await this.getStyles();

        // TODO: If no style found, try to take default one
        const style = Objects.getObjectAt<any>(styleKey, styles);

        if (style) {
            return style;
        }

        const defaultStyle = this.styleHandlers
            .map(handler => handler.getDefaultStyle(styleKey))
            .find(x => !!x);

        if (defaultStyle) {
            return defaultStyle;
        }

        console.warn(`Neither style nor default can be fetched by key "${styleKey}".`);

        return null;
    }

    public async addColorVariation(variationName: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        const newVariation: any = Objects.clone(styles["colors"]["default"]);
        newVariation.key = `colors/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        Objects.setValue(`colors/${variationName}`, styles, newVariation);

        await this.updateStyles(styles);

        return newVariation;
    }

    public async getColors(): Promise<ColorContract[]> {
        return this.getPrimitives<ColorContract>("colors");
    }

    public async addGradientVariation(variationName: string): Promise<LinearGradientContract> {
        const styles = await this.getStyles();
        const gradient: LinearGradientContract = {
            key: `gradients/${variationName}`,
            displayName: "Gradient",
            direction: "45deg",
            colorStops: [{
                color: "#87E0FD",
                length: 0
            },
            {
                color: "#05ABE0",
                length: 100
            }]
        };
        gradient.displayName = "< Unnamed >";
        Objects.setValue(`gradients/${variationName}`, styles, gradient);

        await this.updateStyles(styles);

        return gradient;
    }

    private async getPrimitives<T>(type: string): Promise<T[]> {
        const styles = await this.getStyles();

        const primitives = styles[type]
            ? Object
                .values<T>(styles[type])
                .filter(primitive => !!primitive)
            : [];

        return this.sortByDisplayName(primitives);
    }

    public async getGadients(): Promise<LinearGradientContract[]> {
        return this.getPrimitives<LinearGradientContract>("gradients");
    }

    public async addShadowVariation(variationName: string): Promise<ShadowContract> {
        const styles = await this.getStyles();
        const newVariation: any = { blur: 1, spread: 1, color: "rgba(0, 0, 0, 0.1)", inset: false, offsetX: 1, offsetY: 1 };
        newVariation.key = `shadows/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        Objects.setValue(`shadows/${variationName}`, styles, newVariation);

        await this.updateStyles(styles);

        return newVariation;
    }

    public async getShadows(): Promise<ShadowContract[]> {
        const shadows = await this.getPrimitives<ShadowContract>("shadows");
        return shadows.filter(x => x !== null && x.key !== "shadows/none");
    }

    public async getAnimations(): Promise<AnimationContract[]> {
        const animations = await this.getPrimitives<AnimationContract>("animations");
        return animations.filter(x => x !== null && x.key !== "animations/none");
    }

    private rewriteVariationKeysRecursively(variation: VariationContract, parentKey: string): void {
        variation.key = parentKey;

        if (!variation.components) {
            return;
        }

        Object.keys(variation.components).forEach(componentKey => {
            const subComponent = variation.components[componentKey];

            Object.keys(subComponent).forEach(subComponentVariationKey => {
                const subComponentVariation = subComponent[subComponentVariationKey];
                const key = `${parentKey}/components/${componentKey}/${subComponentVariationKey}`;

                this.rewriteVariationKeysRecursively(subComponentVariation, key);
            });
        });
    }

    public async addComponentVariation(componentName: string, variationName: string, snippet?: ComponentStyle): Promise<string> {
        const styles = await this.getStyles();
        const defaultVariation = snippet.variations.find(x => x.key === `components/${componentName}/default`);

        if (!defaultVariation) {
            throw new Error(`Default variation for component "${componentName}" not found.`);
        }

        const variation: VariationContract = Objects.clone(defaultVariation);
        const key = `components/${componentName}/${variationName}`;

        this.rewriteVariationKeysRecursively(variation, key);

        variation.key = key;
        variation.displayName = "< Unnamed >";
        variation.category = "appearance";

        styles.components[componentName][variationName] = variation;

        await this.updateStyles(styles);

        return variation.key;
    }

    public async addTextStyleVariation(variationName: string): Promise<VariationContract> {
        const styles = await this.getStyles();

        const variation: VariationContract = {
            key: `globals/body/${variationName}`,
            displayName: "< Unnamed >"
        };

        styles.globals["body"][variationName] = variation;

        await this.updateStyles(styles);

        return variation;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        await this.objectStorage.updateObject(stylesPath, updatedStyles);
    }

    public async mergeStyles(appendStyles: ThemeContract): Promise<void> {
        const styles = await this.getStyles();
        await this.updateStyles(_.merge(styles, appendStyles));
    }

    public async updateStyle(style: VariationContract): Promise<void> {
        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!style.key) {
            throw new Error("Style doesn't have key.");
        }

        const styles = await this.getStyles();

        Objects.setValue(style.key, styles, style);

        await this.updateStyles(styles);
    }

    public async getVariations<TVariation>(categoryName: string, subCategoryName?: string): Promise<TVariation[]> {
        if (!categoryName) {
            throw new Error(`Parameter "categoryName" not specified.`);
        }

        const styles = await this.getStyles();

        let categoryStyles: { [x: string]: any; };

        if (subCategoryName) {
            categoryStyles = styles[categoryName][subCategoryName];
        }
        else {
            categoryStyles = styles[categoryName];
        }

        if (!categoryStyles) {
            return [];
        }

        const category = Object.keys(categoryStyles);
        const states = this.getAllowedStates(categoryStyles);

        const variations = category.map(variationName => {
            const variationContract = categoryStyles[variationName];

            if (states && variationName !== "default") {
                variationContract["allowedStates"] = states;
            }

            return variationContract;
        });

        return variations.filter(variation => !!variation);
    }

    public getAllowedStates(styles: any): string[] {
        const states = styles["default"]["allowedStates"];

        if (states) {
            return states;
        }

        return undefined;
    }

    public async getComponentVariations(componentName: string): Promise<VariationContract[]> {
        if (!componentName) {
            throw new Error(`Parameter "componentName" not specified.`);
        }

        const styles = await this.getStyles();

        const componentStyles = styles.components[componentName];

        if (!componentStyles) {
            return [];
        }

        const states = this.getAllowedStates(componentStyles);

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            if (states && variationName !== "default") {
                variationContract.allowedStates = states;
            }
            return variationContract;
        });

        return variations;
    }

    public async removeStyle(styleKey: string): Promise<void> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        Objects.setValue(styleKey, styles, null);

        await this.objectStorage.updateObject(`${stylesPath}`, styles);
    }

    public async checkStyleIsInUse(styleKey: string): Promise<any[]> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        const style = Objects.getObjectAt(styleKey, styles);

        const referencedStyles = Utils.findNodesRecursively((node: any) => {
            let found = false;

            if (node !== style && node.displayName) {
                const res = Utils.findNodesRecursively((styleNode: any) => {
                    let f = false;
                    Object.keys(styleNode).forEach(y => {
                        if (styleNode[y] === styleKey) {
                            f = true;
                        }
                    });
                    return f;
                }, node);

                if (res.length > 0) {
                    found = true;
                }
            }

            return found;
        }, styles);

        return referencedStyles;
    }

    public async addIcon(glyph: OpenTypeFontGlyph): Promise<void> {
        const styles = await this.getStyles();
        await this.fontManager.addGlyph(styles, glyph);
        await this.updateStyles(styles);
    }

    public async removeIcon(iconKey: string): Promise<void> {
        const styles = await this.getStyles();

        const icon = Objects.getObjectAt<FontGlyphContract>(iconKey, styles);

        if (icon) {
            await this.fontManager.removeGlyph(styles, icon.unicode);
            await this.removeStyle(iconKey);
        }
    }

    public async getIcons(): Promise<FontGlyphContract[]> {
        const icons = await this.getPrimitives<FontGlyphContract>("icons");
        return icons;
    }

    public async getIconFont(): Promise<FontContract> {
        const styles = await this.getStyles();
        const iconFont: FontContract = Objects.getObjectAt<FontContract>("fonts/icons", styles);

        return iconFont;
    }

    public async getExternalIconFonts(): Promise<FontContract[]> {
        const iconFontsUrl = Constants.iconsFontsLibraryUrl;

        const response = await this.httpClient.send({
            url: iconFontsUrl,
            method: "GET"
        });

        if (response.statusCode !== 200) {
            return [];
        }

        const iconFontsData = <any>response.toObject();

        return iconFontsData.fonts;
    }

    public async getFonts(): Promise<FontContract[]> {
        const fonts = await this.getPrimitives<FontContract>("fonts");
        return fonts;
    }

    public async getFont(fontKey: string): Promise<FontContract> {
        const fonts = await this.getPrimitives<FontContract>("fonts");
        return fonts.find(x => x.key === fontKey);
    }

    public async getTextVariations(): Promise<VariationContract[]> {
        const textStylesVariations = await this.getVariations("globals", "body");
        return this.sortByDisplayName(textStylesVariations);
    }

    public async backfillLocalStyles(handlerClass: any, localStyles: LocalStyles): Promise<void> {
        const handler = this.widgetHandlers.find(x => x instanceof handlerClass);

        if (!handler?.getStyleDefinitions) {
            return;
        }

        const definition = handler.getStyleDefinitions();

        if (!definition) {
            return;
        }

        StyleHelper.backfillLocalStyles(definition, localStyles);

        if (definition.colors) {
            await this.backfillGlobals(definition);
        }
    }

    private async backfillGlobals(definition: StyleDefinition): Promise<void> {
        const styles = await this.getStyles();
        const colorNames = Object.keys(definition.colors);

        colorNames.forEach(colorName => {
            const colorDefinition = definition.colors[colorName];
            const colorKey = `colors/${colorName}`;

            Objects.setValue(colorKey, styles, {
                key: colorKey,
                displayName: colorDefinition.displayName,
                value: colorDefinition.defaults.value
            });
        });

        this.updateStyles(styles);
    }

    public async backfillStyles(): Promise<void> {
        const styles = await this.getStyles();

        this.widgetHandlers.forEach(x => {
            if (!x.getStyleDefinitions) {
                return;
            }

            const definition = x.getStyleDefinitions();

            if (!definition) {
                return;
            }

            if (definition.colors) {
                const colorNames = Object.keys(definition.colors);

                colorNames.forEach(colorName => {
                    const colorDefinition = definition.colors[colorName];
                    const colorKey = `colors/${colorName}`;

                    Objects.setValue(colorKey, styles, {
                        key: colorKey,
                        displayName: colorDefinition.displayName,
                        value: colorDefinition.defaults.value
                    });
                });
            }
        });

        this.updateStyles(styles);
    }
}