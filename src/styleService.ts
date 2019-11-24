import * as _ from "lodash";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage } from "@paperbits/common/persistence";
import { EventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract, ShadowContract } from "./contracts";
import { StyleItem } from "./models/styleItem";
import { ComponentStyle } from "./contracts/componentStyle";
import { StyleHandler, StyleContract } from "@paperbits/common/styles";


const stylesPath = "styles";

export class StyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly eventManager: EventManager,
        private readonly styleHandlers: StyleHandler[]
    ) { }

    public async getStyles(): Promise<ThemeContract> {
        const stylesObject = await this.objectStorage.getObject<ThemeContract>(stylesPath);

        if (!stylesObject) {
            throw new Error("Data doesn't contain styles.");
        }

        this.styleHandlers.forEach(styleHandler => {
            if (styleHandler.migrate) {
                styleHandler.migrate(stylesObject.components[styleHandler.key]);
            }

            if (stylesObject.components[styleHandler.key]) {
                return;
            }

            stylesObject.components[styleHandler.key] = styleHandler.getDefaultStyle();
        });

        return stylesObject;
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
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

        throw new Error(`Neither style nor default can be fetched by key "${styleKey}".`);
    }

    public async addColorVariation(variationName: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        const newVariation: any = Objects.clone(styles["colors"]["default"]);
        newVariation.key = `colors/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        styles["colors"][variationName] = newVariation;

        this.updateStyles(styles);

        return newVariation;
    }

    public async addShadowVariation(variationName: string): Promise<ShadowContract> {
        const styles = await this.getStyles();
        const newVariation: any = { blur: 1, spread: 1, color: "rgba(0, 0, 0, 0.1)", inset: false, offsetX: 1, offsetY: 1 };
        newVariation.key = `shadows/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        styles["shadows"][variationName] = newVariation;

        this.updateStyles(styles);

        return newVariation;
    }

    private rewriteVariationKeysRecursively(variation: Object, parentKey: string): void {
        variation["key"] = parentKey;

        if (!variation["components"]) {
            return;
        }

        Object.keys(variation["components"]).forEach(componentKey => {
            const subComponent = variation["components"][componentKey];

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

        const variation: StyleItem = Objects.clone(defaultVariation);
        const key = `components/${componentName}/${variationName}`;

        this.rewriteVariationKeysRecursively(variation, key);

        variation.key = key;
        variation.displayName = "< Unnamed >";
        variation.category = "appearance";

        styles.components[componentName][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async addTextStyleVariation(variationName: string): Promise<StyleContract> {
        const styles = await this.getStyles();

        const variation: any = {
            key: `globals/body/${variationName}`,
            displayName: "< Unnamed >"
        };

        styles.globals["body"][variationName] = variation;

        this.updateStyles(styles);

        return variation;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async mergeStyles(appendStyles: ThemeContract): Promise<void> {
        const styles = await this.getStyles();
        await this.updateStyles(_.merge(styles, appendStyles));
    }

    public async updateStyle(style: StyleContract): Promise<void> {
        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!style.key) {
            throw new Error("Style doesn't have key.");
        }

        const styles = await this.getStyles();
        
        Objects.mergeDeepAt(style.key, styles, style);

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

        const category = Object.keys(categoryStyles);
        const states = this.getAllowedStates(categoryStyles);

        const variations = category.map(variationName => {
            const variationContract = categoryStyles[variationName];

            if (states && variationName !== "default") {
                variationContract["allowedStates"] = states;
            }

            return variationContract;
        });

        return variations;
    }

    public getAllowedStates(styles: any): [] {
        const states = styles["default"]["allowedStates"];
        if (states) {
            return states;
        }
        return undefined;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        if (!componentName) {
            throw new Error(`Parameter "componentName" not specified.`);
        }

        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const states = this.getAllowedStates(componentStyles);

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            if (states && variationName !== "default") {
                variationContract["allowedStates"] = states;
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
        Objects.deleteNodeAt(`${styleKey}`, styles);
        this.objectStorage.updateObject(`${stylesPath}`, styles);

        this.eventManager.dispatchEvent("onStyleChange");
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

}