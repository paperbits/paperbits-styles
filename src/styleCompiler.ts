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
    StatesStylePlugin
} from "./plugins";
import jss from "jss";
import preset from "jss-preset-default";

const opts = preset();

opts.createGenerateClassName = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);


export class StyleCompiler {
    public plugins: Bag<StylePlugin>;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaPermalinkResolver: IPermalinkResolver,
    ) {
        this.plugins = {};
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
        this.plugins["border"] = new BorderStylePlugin();
        this.plugins["borderRadius"] = new BorderRadiusStylePlugin();
        this.plugins["background"] = new BackgroundStylePlugin(this.styleService, this.mediaPermalinkResolver);
        this.plugins["shadow"] = new ShadowStylePlugin(themeContract);
        this.plugins["animation"] = new AnimationStylePlugin(themeContract);
        this.plugins["typography"] = new TypographyStylePlugin(themeContract);
        this.plugins["components"] = new ComponentsStylePlugin(this);
        this.plugins["states"] = new StatesStylePlugin(this);

        const allStyles = {
            "@global": {}
        };

        const fontsPlugin = new FontsStylePlugin(themeContract);
        const fontsRules = await fontsPlugin.contractToJss();
        Utils.assign(allStyles, fontsRules);

        if (themeContract.components) {
            for (const componentName of Object.keys(themeContract.components)) {
                const componentConfig = themeContract.components[componentName];

                const defaultComponentStyles = await this.getVariationClasses(componentConfig["default"], componentName, "default", false);

                for (const variationName of Object.keys(componentConfig)) {
                    const variationStyles = await this.getVariationClasses(componentConfig[variationName], componentName, variationName, true);
                    const key = `& .${componentName}-${variationName}`;
                    defaultComponentStyles[componentName] = { ...defaultComponentStyles[componentName], [`&.${componentName}-${variationName}`]: variationStyles[key] };
                }

                delete defaultComponentStyles[componentName][`&.${componentName}-default`];

                Utils.assign(allStyles, defaultComponentStyles);
            }
        }

        if (themeContract.instances) {
            for (const instanceName of Object.keys(themeContract.instances)) {
                const instanceConfig = themeContract.instances[instanceName];

                const pluginRules = await this.getVariationClasses(instanceConfig, instanceName);
                Utils.assign(allStyles, pluginRules);
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
                const pluginRules = await this.getVariationClasses(themeContract.globals[tagName], tagName);
                Utils.assign(allStyles["@global"], pluginRules);
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

        const fontsPlugin = new FontsStylePlugin(themeContract);
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

    public async getClassNameByStyleKeyAsync(key: string, breakpoint?: string): Promise<string> {
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
        const styles = await this.styleService.getStyles();
        const style = Objects.getObjectAt(key, styles);

        if (style && style["class"]) {
            classNames.push(style["class"][breakpoint || "xs"]);
        }

        return classNames.join(" ");
    }
}