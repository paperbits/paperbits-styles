import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { StyleService } from "./styleService";
import { Bag } from "@paperbits/common";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { BreakpointValues } from "@paperbits/common/styles/breakpoints";
import {
    StylePlugin,
    FontsStylePlugin,
    PaddingStylePlugin,
    MarginStylePlugin,
    BorderStylePlugin,
    BorderRadiusStylePlugin,
    BackgroundStylePlugin,
    ShadowStylePlugin,
    AnimationStylePlugin,
    TypographyStylePlugin,
    ComponentsStylePlugin,
    StatesStylePlugin,
    ContainerStylePlugin
} from "./plugins";
import jss from "jss";
import preset from "jss-preset-default";
import { GridStylePlugin } from "./plugins/gridStylePlugin";
import { GridCellStylePlugin } from "./plugins/gridCellStylePlugin";
import { IStyleCompiler, StyleModel } from "@paperbits/common/styles";
import { StyleContract } from "@paperbits/common/styles/styleConfig";

const opts = preset();

opts.createGenerateClassName = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);


export class StyleCompiler implements IStyleCompiler {
    public plugins: Bag<StylePlugin>;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaPermalinkResolver: IPermalinkResolver
    ) {
        this.plugins = {};
        this.plugins["grid"] = new GridStylePlugin();
        this.plugins["grid-cell"] = new GridCellStylePlugin();
    }

    private isResponsive(variation: Object): boolean {
        return Object.keys(variation).some(x => Object.keys(BreakpointValues).includes(x));
    }

    private isResponsive2(variation: Object): boolean {
        if (!variation) {
            throw new Error(`Parameter "variation" not specified.`);
        }

        return Object.keys(variation).some(x => Object.keys(BreakpointValues).includes(x));
    }

    /**
     * Returns compliled CSS.
     */
    public async compile(): Promise<string> {
        const themeContract = await this.styleService.getStyles();

        this.plugins["padding"] = new PaddingStylePlugin();
        this.plugins["margin"] = new MarginStylePlugin();
        this.plugins["border"] = new BorderStylePlugin(themeContract);
        this.plugins["borderRadius"] = new BorderRadiusStylePlugin();
        this.plugins["background"] = new BackgroundStylePlugin(this.styleService, this.mediaPermalinkResolver);
        this.plugins["shadow"] = new ShadowStylePlugin(themeContract);
        this.plugins["animation"] = new AnimationStylePlugin(themeContract);
        this.plugins["typography"] = new TypographyStylePlugin(themeContract);
        this.plugins["components"] = new ComponentsStylePlugin(this);
        this.plugins["states"] = new StatesStylePlugin(this);
        this.plugins["grid"] = new GridStylePlugin();
        this.plugins["grid-cell"] = new GridCellStylePlugin();
        this.plugins["container"] = new ContainerStylePlugin();

        const allStyles = {
            "@global": {}
        };

        const fontsPlugin = new FontsStylePlugin(this.mediaPermalinkResolver, themeContract);
        const fontsRules = await fontsPlugin.contractToJss();
        Utils.assign(allStyles, fontsRules);

        if (themeContract.components) {
            for (const componentName of Object.keys(themeContract.components)) {
                const componentConfig = themeContract.components[componentName];

                const defaultComponentStyles = await this.getVariationClasses(componentConfig["default"], componentName, "default", false);

                for (const variationName of Object.keys(componentConfig)) {
                    if (variationName === "default") continue;
                    const variationStyles = await this.getVariationClasses(componentConfig[variationName], componentName, variationName, true);
                    const key = `& .${componentName}-${variationName}`;
                    defaultComponentStyles[componentName] = { ...defaultComponentStyles[componentName], [`&.${componentName}-${variationName}`]: variationStyles[key] };
                }

                Utils.assign(allStyles, defaultComponentStyles);
            }
        }

        if (themeContract.utils) {
            for (const variationName of Object.keys(themeContract.utils.text)) {
                const classes = await this.getVariationClasses(themeContract.utils.text[variationName], "text", variationName);
                Utils.assign(allStyles, classes);
            }

            for (const variationName of Object.keys(themeContract.utils.content)) {
                const classes = await this.getVariationClasses(themeContract.utils.content[variationName], "content", variationName);
                Utils.assign(allStyles, classes);
            }
        }

        if (themeContract.globals) {
            for (const tagName of Object.keys(themeContract.globals)) {

                const tagConfig = themeContract.globals[tagName];

                let defaultComponentStyles = await this.getVariationClasses(tagConfig["default"], tagName, "default", false);

                for (const variationName of Object.keys(tagConfig)) {
                    if (variationName === "default") continue;
                    const componentName = tagName === "body" ? "text" : tagName;
                    const variationStyles = await this.getVariationClasses(tagConfig[variationName], componentName, variationName, true);

                    const key = `& .${componentName}-${variationName}`;
                    if (tagName === "body") {
                        defaultComponentStyles = { ...defaultComponentStyles, [`.${componentName}-${variationName}`]: variationStyles[key] };
                    } else {
                        defaultComponentStyles[tagName] = { ...defaultComponentStyles[tagName], [`&.${componentName}-${variationName}`]: variationStyles[key] };
                    }
                }

                Utils.assign(allStyles["@global"], defaultComponentStyles);
            }
        }

        if (themeContract.colors) {
            for (const colorName of Object.keys(themeContract.colors)) {
                allStyles[`colors-${Utils.camelCaseToKebabCase(colorName)}`] = { color: themeContract.colors[colorName].value };
            }
        }

        const responsiveStyleRules = {};

        for (const breakpoint of Object.keys(BreakpointValues)) {
            const breakpointValue = BreakpointValues[breakpoint];
            const breakpointKey = `@media (min-width: ${breakpointValue}px)`;
            responsiveStyleRules[breakpointKey] = allStyles[breakpointKey];
            delete allStyles[breakpointKey];
        }

        const styleSheet = jss.createStyleSheet(allStyles);
        const responsiveStyleSheet = jss.createStyleSheet(responsiveStyleRules);

        /* We have to ensure that responsive style rules come after regular ones */
        return styleSheet.toString() + "\n" + responsiveStyleSheet.toString();
    }

    public async getVariationClasses(variationConfig, componentName: string, variationName: string = null, isNested: boolean = false): Promise<object> {
        const result = {};

        if (!variationName) {
            variationName = "default";
        }

        for (const pluginName of Object.keys(variationConfig)) {
            if (pluginName === "allowedStates") {
                continue;
            }
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginConfig = variationConfig[pluginName];

                if (this.isResponsive(pluginConfig)) {
                    /**
                     * Ensure that media-queried classes rendered after regular ones.
                     */
                    for (const breakpoint of Object.keys(BreakpointValues)) {
                        const breakpointConfig = pluginConfig[breakpoint];

                        if (breakpointConfig) {
                            if (breakpoint === "xs") { // No need media query
                                let className = `${componentName}-${variationName}`.replace("-default", "");

                                if (isNested) {
                                    className = `& .${Utils.camelCaseToKebabCase(className)}`;
                                }

                                const pluginRules = await plugin.contractToJss(breakpointConfig);
                                result[className] = result[className] || {};

                                Utils.assign(result[className], pluginRules);
                            }
                            else {
                                const mediaQuerKey = `@media (min-width: ${BreakpointValues[breakpoint]}px)`;
                                result[mediaQuerKey] = result[mediaQuerKey] || {};

                                const pluginRules = await plugin.contractToJss(breakpointConfig);

                                let className = `${componentName}-${breakpoint}-${variationName}`.replace("-default", "");

                                if (isNested) {
                                    className = `& .${Utils.camelCaseToKebabCase(className)}`;
                                }

                                result[mediaQuerKey][className] = result[mediaQuerKey][className] || {};

                                Utils.assign(result[mediaQuerKey][className], pluginRules);
                            }
                        }
                    }
                }
                else {
                    let className = `${componentName}-${variationName}`.replace("-default", "");

                    if (isNested) {
                        className = `& .${Utils.camelCaseToKebabCase(className)}`;
                    }

                    const pluginRules = await plugin.contractToJss(pluginConfig);
                    result[className] = result[className] || {};

                    Utils.assign(result[className], pluginRules);
                }
            }
        }

        return result;
    }

    public getVariationClassNames(variationConfig, componentName: string, variationName: string = null): string[] {
        const classNames = [];

        if (!variationName) {
            variationName = "default";
        }

        for (const pluginName of Object.keys(variationConfig)) {
            const pluginConfig = variationConfig[pluginName];

            if (this.isResponsive(pluginConfig)) {
                for (const breakpoint of Object.keys(BreakpointValues)) {
                    const breakpointConfig = pluginConfig[breakpoint];

                    if (breakpointConfig) {
                        let className;

                        if (breakpoint === "xs") {
                            className = `${componentName}-${variationName}`.replace("-default", "");
                        }
                        else {
                            className = `${componentName}-${breakpoint}-${variationName}`.replace("-default", "");
                        }

                        classNames.push(className);
                    }
                }
            }
            else {
                const className = `${componentName}-${variationName}`.replace("-default", "");
                classNames.push(className);
            }

        }

        return classNames;
    }

    public async getStateClasses(stateConfig, stateName: string): Promise<object> {
        const result = {};

        for (const pluginName of Object.keys(stateConfig)) {
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginConfig = stateConfig[pluginName];
                const className = `&:${stateName}`;
                const pluginRules = await plugin.contractToJss(pluginConfig);

                result[className] = result[className] || {};

                Utils.assign(result[className], pluginRules);
            }
        }

        return result;
    }

    public async getFontsStyles(): Promise<string> {
        const themeContract = await this.styleService.getStyles();
        const result = {};

        const fontsPlugin = new FontsStylePlugin(this.mediaPermalinkResolver, themeContract);
        const fontsRules = await fontsPlugin.contractToJss();

        Utils.assign(result, fontsRules);

        const styleSheet = jss.createStyleSheet(result);

        return styleSheet.toString();
    }

    public getClassNamesByStyleConfig(styleConfig: any): string {
        if (!styleConfig) {
            throw new Error(`Parameter "styleConfig" not specified.`);
        }

        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (categoryConfig) {
                if (this.isResponsive2(categoryConfig)) {
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

        if (key.startsWith("globals/")) {
            return null;
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

    public async getClassNamesByStyleConfigAsync(styleConfig: any): Promise<string> {
        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (categoryConfig) {
                if (this.isResponsive2(categoryConfig)) {
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

    public async getClassNamesByStyleConfigAsync2(styleConfig: any): Promise<StyleModel> {
        const classNames = [];
        let jss;
        let key;

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (category === "instance") {
                const instanceClassName = categoryConfig.key || Utils.randomClassName();
                categoryConfig.key = instanceClassName;
                key = categoryConfig.key;
                jss = await this.getVariationClasses(categoryConfig, instanceClassName);

                const instanceClassNames = await this.getVariationClassNames(categoryConfig, instanceClassName);
                instanceClassNames.forEach(x => classNames.push(x));
            }
            else {
                if (categoryConfig) {
                    if (this.isResponsive2(categoryConfig)) {
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

        }

        const result: StyleModel = {
            key: key,
            classNames: classNames.join(" "),
            css: await this.jssToCss(jss)
        };

        return result;
    }

    public async getClassNameByStyleKeyAsync(key: string, breakpoint?: string): Promise<string> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        const segments = key.split("/");

        if (key.startsWith("globals/") && segments[1] !== "body") {
            return null;
        }

        let component = segments[1];
        const componentVariation = segments[2];
        const classNames = [];

        if (component === "body") {
            component = "text";
        }
        else {
            classNames.push(Utils.camelCaseToKebabCase(component));
        }

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
        const styles = await this.styleService.getStyles();
        const style = Objects.getObjectAt(key, styles);

        if (style && style["class"]) {
            classNames.push(style["class"][breakpoint || "xs"]);
        }

        return classNames.join(" ");
    }

    public jssToCss?(jssObject: object): string {
        const styleSheet = jss.createStyleSheet(jssObject);
        return styleSheet.toString();
    }
}