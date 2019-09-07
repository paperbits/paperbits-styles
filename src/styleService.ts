import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract } from "./contracts";
import { StyleItem } from "./models/styleItem";
import * as _ from "lodash";

const stylesPath = "styles";

export class StyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly eventManager: IEventManager
    ) { }

    public async getStyles(): Promise<ThemeContract> {
        const stylesObject = await this.objectStorage.getObject<ThemeContract>(stylesPath);

        if (!stylesObject) {
            throw new Error("Data doesn't contain styles.");
        }

        return stylesObject;
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newVariation: any = Objects.clone(styles["colors"]["default"]);
        newVariation.key = `colors/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        styles["colors"][variationName] = newVariation;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addShadowVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newVariation: any = { blur: 1, spread: 1, color: "rgba(0, 0, 0, 0.1)", inset: false, offsetX: 1, offsetY: 1 };
        newVariation.key = `shadows/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        styles["shadows"][variationName] = newVariation;

        this.updateStyles(styles);

        return `shadows/${variationName}`;
    }

    public async addNavbarVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const variation: any = {
            key: `components/navbar/${variationName}`,
            displayName: "< Unnamed >",
            category: "appearance",
            components: {
                navLink : {
                    default: {
                        key: `components/navbar/${variationName}/components/navLink/default`,
                        displayName: "Nav item",
                        allowedStates: [
                            "hover",
                            "focus",
                            "active"
                        ]
                    },
                    active: {
                        key: `components/navbar/${variationName}/components/navLink/active`,
                        displayName: "Nav item (active)",
                        allowedStates: [
                            "hover",
                            "focus",
                            "active"
                        ]
                    }
                }
            }
        };

        const states = this.getAllowedStates(styles.components["navbar"]);
        if (states) {
            variation["allowedStates"] = states;
        }

        styles.components["navbar"][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async addComponentVariation(componentName: string, variationName: string, snippet?: StyleItem): Promise<string> {
        const styles = await this.getStyles();

        const variation: any = snippet && snippet.itemConfig || {};
        if (snippet && snippet.key) {
            const parts = snippet.key.split("/");
            variation.key = snippet.key;
            componentName = parts[1];
            variationName = parts[2];
        } else {
            variation.key = `components/${componentName}/${variationName}`;
            const states = this.getAllowedStates(styles.components[componentName]);
            if (states) {
                variation["allowedStates"] = states;
            }
        }
        variation.displayName = "< Unnamed >";
        variation.category = "appearance";        

        styles.components[componentName][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async addTextStyleVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const variation: any = {
            key: `globals/body/${variationName}`,
            displayName: "< Unnamed >"
        };

        styles.globals["body"][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async mergeStyles(appendStyles: ThemeContract): Promise<void> {
        const styles = await this.getStyles();
        await this.updateStyles(_.merge(styles, appendStyles));
    }

    public async updateStyle(style: any): Promise<void> {
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
        } else {
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

    public async getStyleByKey(styleKey: string): Promise<any> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        return Objects.getObjectAt<any>(styleKey, styles);
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