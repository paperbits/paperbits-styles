import * as Utils from "@paperbits/common/utils";
import { IStyleService, BreakpointValues } from "@paperbits/common/styles";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract } from "./contracts";

const stylesPath = "styles";

export class StyleService implements IStyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly eventManager: IEventManager
    ) { }

    private isResponsive(variation: Object): boolean {
        if (!variation) {
            throw new Error(`Parameter "variation" not specified.`);
        }

        return Object.keys(variation).some(x => Object.keys(BreakpointValues).includes(x));
    }

    public async getStyles(): Promise<ThemeContract> {
        // console.log(JSON.stringify(config));
        // return config;
        return await this.objectStorage.getObject<ThemeContract>(stylesPath);
    }

    public getClassNamesByStyleConfig(styleConfig: any): string {
        if (!styleConfig) {
            throw new Error(`Parameter "styleConfig" not specified.`);
        }

        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (categoryConfig) {
                if (this.isResponsive(categoryConfig)) {
                    for (const breakpoint of Object.keys(categoryConfig)) {
                        let className;

                        if (breakpoint === "xs") {
                            className = this.getClassNameByStyleKey(categoryConfig[breakpoint]);
                        }
                        else {
                            className = this.getClassNameByStyleKey(categoryConfig[breakpoint], breakpoint);
                        }

                        if (className) {
                            classNames.push(className);
                        }
                    }
                }
                else {
                    const className = this.getClassNameByStyleKey(categoryConfig);

                    if (className) {
                        classNames.push(className);
                    }
                }
            }
        }

        return classNames.join(" ");
    }

    public getClassNameByColorKey(colorKey: string): string {
        return Utils.camelCaseToKebabCase(colorKey.replaceAll("/", "-"));
    }

    public getClassNameByStyleKey(key: string, breakpoint?: string): string {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        if (key.startsWith("globals") && !key.startsWith("globals/text")) {
            return null;
        }

        // const styles = awa this.getStyles();

        const segments = key.split("/");
        const component = segments[1];
        const componentVariation = segments[2];
        const classNames = [];

        classNames.push(Utils.camelCaseToKebabCase(component));

        if (componentVariation) {
            let className;

            if (breakpoint) {
                className = `${component}-${breakpoint}-${componentVariation}`;
            }
            else {
                className = `${component}-${componentVariation}`;
            }

            className = Utils.camelCaseToKebabCase(className);
            classNames.push(className);
        }

        // TODO: Consider a case: components/navbar/default/components/navlink

        return classNames.join(" ");
    }

    public async getClassNamesByStyleConfigAsync(styleConfig: any): Promise<string> {
        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (categoryConfig) {
                if (this.isResponsive(categoryConfig)) {
                    for (const breakpoint of Object.keys(categoryConfig)) {
                        let className;

                        if (breakpoint === "xs") {
                            className = await this.getClassNameByStyleKeyAsync(categoryConfig[breakpoint]);
                        }
                        else {
                            className = await this.getClassNameByStyleKeyAsync(categoryConfig[breakpoint], breakpoint);
                        }

                        if (className) {
                            classNames.push(className);
                        }
                    }
                }
                else {
                    const className = await this.getClassNameByStyleKeyAsync(categoryConfig);

                    if (className) {
                        classNames.push(className);
                    }
                }
            }
        }

        return classNames.join(" ");
    }

    public async getClassNameByStyleKeyAsync(key: string, breakpoint?: string): Promise<string> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        if (key.startsWith("globals") && !key.startsWith("globals/text")) {
            return null;
        }

        const styles = await this.getStyles();
        const style = Utils.getObjectAt(key, styles);

        if (style && style["class"]) {
            return style["class"][breakpoint || "xs"];
        }

        const segments = key.split("/");
        const component = segments[1];
        const componentVariation = segments[2];
        const classNames = [];

        classNames.push(Utils.camelCaseToKebabCase(component));

        if (componentVariation) {
            let className;

            if (breakpoint) {
                className = `${component}-${breakpoint}-${componentVariation}`;
            }
            else {
                className = `${component}-${componentVariation}`;
            }

            className = Utils.camelCaseToKebabCase(className);
            classNames.push(className);
        }

        // TODO: Consider a case: components/navbar/default/components/navlink

        return classNames.join(" ");
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

        const styles = await this.getStyles();
        Utils.setValue(styleKey, styles, null);
        await this.updateStyles(styles);
    }
}