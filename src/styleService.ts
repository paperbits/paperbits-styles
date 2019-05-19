import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract } from "./contracts";

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

    public async getColorByKey(colorKey: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        return Objects.getObjectAt<ColorContract>(colorKey, styles);
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newColor: any = Objects.clone(styles["colors"]["default"]);
        newColor.key = `colors/${variationName}`;
        newColor.displayName = "< Unnamed >";

        styles["colors"][variationName] = newColor;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addComponentVariation(componentName: string, variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const variation: any = {
            key: `components/${componentName}/${variationName}`,
            displayName: "< Unnammed >"
        };

        const states = this.getAllowedStates(styles.components[componentName]);
        if (states) {
            variation["allowedStates"] = states;
        }

        styles.components[componentName][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async addTextStyleVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const variation: any = {
            key: `globals/body/${variationName}`,
            displayName: "< Unnammed >"
        };

        styles.globals["body"][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async updateStyle(style): Promise<void> {
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
        return Objects.getObjectAt<ColorContract>(styleKey, styles);
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