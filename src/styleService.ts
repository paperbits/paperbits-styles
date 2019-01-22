import * as Utils from "@paperbits/common/utils";
import { BreakpointValues } from "@paperbits/common/styles";
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
        return Utils.getObjectAt<ColorContract>(colorKey, styles);
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newColor: any = Utils.clone(styles["colors"]["default"]);
        newColor.key = `colors/${variationName}`;

        styles["colors"][variationName] = newColor;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addComponentVariation(componentName: string, variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const newVariation: any = Utils.clone(styles["components"][componentName]["default"]);
        newVariation.key = `components/${componentName}/${variationName}`;

        styles["components"][componentName][variationName] = newVariation;

        this.updateStyles(styles);

        return `components/${componentName}/${variationName}`;
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
        Utils.mergeDeepAt(style.key, styles, style);
        await this.updateStyles(styles);
    }

    public async getVariations<TVariation>(categoryName: string): Promise<TVariation[]> {
        if (!categoryName) {
            throw new Error(`Parameter "categoryName" not specified.`);
        }

        const styles = await this.getStyles();

        const variations = Object.keys(styles[categoryName]).map(variationName => {
            const variationContract = styles[categoryName][variationName];
            return variationContract;
        });

        return variations;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        if (!componentName) {
            throw new Error(`Parameter "componentName" not specified.`);
        }

        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            return variationContract;
        });

        return variations;
    }

    public async setInstanceStyle(instanceKey: string, instanceStyles: Object): Promise<void> {
        if (!instanceKey) {
            throw new Error(`Parameter "instanceKey" not specified.`);
        }

        if (!instanceStyles) {
            throw new Error(`Parameter "instanceStyles" not specified.`);
        }

        const styles = await this.getStyles();
        Utils.mergeDeepAt(instanceKey, styles, instanceStyles);
        this.updateStyles(styles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(styleKey, styles);
    }

    public async removeStyle(styleKey: string): Promise<void> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }
        this.objectStorage.deleteObject(`${stylesPath}/${styleKey}`);
        this.eventManager.dispatchEvent("onStyleChange");
    }
}