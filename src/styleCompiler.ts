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
    ContainerStylePlugin,
    SizeStylePlugin
} from "./plugins";
import jss from "jss";
import preset from "jss-preset-default";
import { GridStylePlugin } from "./plugins/gridStylePlugin";
import { GridCellStylePlugin } from "./plugins/gridCellStylePlugin";
import { Style, StyleSheet, StyleMediaQuery, IStyleCompiler, StyleModel, StyleRule } from "@paperbits/common/styles";

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
    }

    private isResponsive(variation: Object): boolean {
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
        this.plugins["size"] = new SizeStylePlugin();

        const globalStyles = new StyleSheet();
        const allStyles = new StyleSheet();

        const fontsPlugin = new FontsStylePlugin(this.mediaPermalinkResolver, themeContract);
        const fontFaces = await fontsPlugin.contractToFontFaces();
        globalStyles.fontFaces.push(...fontFaces);

        if (themeContract.components) {
            for (const componentName of Object.keys(themeContract.components)) {
                const componentConfig = themeContract.components[componentName];
                const componentStyle = await this.getVariationStyle(componentConfig["default"], componentName);

                const variations = Object.keys(componentConfig);

                for (const variationName of variations) {
                    if (variationName === "default") {
                        continue;
                    }

                    const variationStyle = await this.getVariationStyle(componentConfig[variationName], componentName, variationName);
                    componentStyle.modifierStyles.push(variationStyle);
                }

                allStyles.styles.push(componentStyle);
            }
        }

        if (themeContract.utils) {
            for (const variationName of Object.keys(themeContract.utils.text)) {
                const textStyle = await this.getVariationStyle(themeContract.utils.text[variationName], "text", variationName);
                allStyles.styles.push(textStyle);
            }

            for (const variationName of Object.keys(themeContract.utils.content)) {
                const contentStyle = await this.getVariationStyle(themeContract.utils.content[variationName], "content", variationName);
                allStyles.styles.push(contentStyle);
            }
        }

        if (themeContract.globals) {
            for (const tagName of Object.keys(themeContract.globals)) {
                const tagConfig = themeContract.globals[tagName];

                const defaultComponentStyle = await this.getVariationStyle(tagConfig["default"], tagName, "default");
                const variations = Object.keys(tagConfig);

                if (!defaultComponentStyle && variations.length <= 1) {
                    continue;
                }

                for (const variationName of variations) {
                    if (variationName === "default") {
                        continue;
                    }

                    const componentName = Utils.camelCaseToKebabCase(tagName === "body" ? "text" : tagName);
                    const variationJss = await this.getVariationStyle(tagConfig[variationName], componentName, variationName);

                    if (variationJss) {
                        const key = `& .${componentName}-${variationName}`;

                        if (tagName === "body") {
                            //  defaultComponentStyle = { ...defaultComponentStyle, [`.${componentName}-${variationName}`]: variationJss[key] };

                        }
                        else {
                            defaultComponentStyle[tagName] = { ...defaultComponentStyle[tagName], [`&.${componentName}-${variationName}`]: variationJss[key] };

                        }
                    }

                    defaultComponentStyle.modifierStyles.push(variationJss);
                }

                globalStyles.styles.push(defaultComponentStyle);
            }
        }

        if (themeContract.colors) {
            for (const colorName of Object.keys(themeContract.colors)) {
                const colorStyleSelector = `colors-${Utils.camelCaseToKebabCase(colorName)}`;
                const colorStyle = new Style(colorStyleSelector);
                colorStyle.rules.push(new StyleRule("color", themeContract.colors[colorName].value));
                allStyles.styles.push(colorStyle);
            }
        }

        const jssObject = JSON.parse(allStyles.toJssString());
        const styleSheet = jss.createStyleSheet(jssObject);
        const globalJssObject = JSON.parse(globalStyles.toJssString());
        const globalStyleSheet = jss.createStyleSheet({ "@global": globalJssObject });
        const css = styleSheet.toString();
        const globalCss = globalStyleSheet.toString();

        return globalCss + " " + css;
    }

    public async getVariationStyle(variationConfig: any, componentName: string, variationName: string = null): Promise<Style> {
        const selector = variationName ? `${componentName}-${variationName}`.replace("-default", "") : componentName;
        const resultStyle = new Style(selector);

        if (!variationName) {
            variationName = "default";
        }

        const mediaQueries = {};

        for (const pluginName of Object.keys(variationConfig)) {
            if (pluginName === "allowedStates") {
                continue;
            }

            const plugin = this.plugins[pluginName];

            if (!plugin) {
                // console.warn(`Plugin "${pluginName}" not registered.`);
                continue;
            }

            const pluginConfig = variationConfig[pluginName];

            if (!this.isResponsive(pluginConfig)) {
                const rules = await plugin.contractToStyleRules(pluginConfig);
                resultStyle.rules.push(...rules);

                const pseudoStyles = await plugin.contractToPseudoStyles(pluginConfig);
                resultStyle.pseudoStyles.push(...pseudoStyles);

                const nestedStyles = await plugin.contractToNestedStyles(pluginConfig);
                resultStyle.nestedStyles.push(...nestedStyles);
            }

            for (const breakpoint of Object.keys(BreakpointValues)) {
                const breakpointConfig = pluginConfig[breakpoint];

                if (!breakpointConfig) {
                    continue;
                }

                if (breakpoint === "xs") { // No need media query
                    const pluginRules = await plugin.contractToStyleRules(breakpointConfig);
                    resultStyle.rules.push(...pluginRules);

                    const pseudoStyles = await plugin.contractToPseudoStyles(breakpointConfig);
                    resultStyle.pseudoStyles.push(...pseudoStyles);

                    const nestedStyles = await plugin.contractToNestedStyles(breakpointConfig);
                    resultStyle.nestedStyles.push(...nestedStyles);
                    continue;
                }

                const selector = `${componentName}-${breakpoint}-${variationName}`.replace("-default", "");

                let mediaQuery = mediaQueries[breakpoint];
                let style;

                if (!mediaQuery) {
                    mediaQuery = new StyleMediaQuery(BreakpointValues[breakpoint]);
                    mediaQueries[breakpoint] = mediaQuery;
                    resultStyle.nestedMediaQueries.push(mediaQuery);

                    style = new Style(selector);
                    mediaQuery.styles.push(style);
                }
                else {
                    style = mediaQuery.styles[0];
                }

                const pluginRules = await plugin.contractToStyleRules(breakpointConfig);
                style.rules.push(...pluginRules);

                const pseudoStyles = await plugin.contractToPseudoStyles(breakpointConfig);
                style.pseudoStyles.push(...pseudoStyles);

                const nestedStyles = await plugin.contractToNestedStyles(breakpointConfig);
                style.nestedStyles.push(...nestedStyles);
            }
        }

        return resultStyle;
    }

    public getVariationClassNames(variationConfig: any, componentName: string, variationName: string = null): string[] {
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

    public async getStateStyle(stateConfig: { [x: string]: any; }, stateName: string): Promise<Style> {
        const stateStyle = new Style(stateName);

        for (const pluginName of Object.keys(stateConfig)) {
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginConfig = stateConfig[pluginName];

                const pluginRules = await plugin.contractToStyleRules(pluginConfig);
                stateStyle.rules.push(...pluginRules);

                const nestedStyles = await plugin.contractToNestedStyles(pluginConfig);
                stateStyle.nestedStyles.push(...nestedStyles);
            }
        }

        return stateStyle;
    }

    public async getFontsStyles(): Promise<string> {
        const themeContract = await this.styleService.getStyles();
        const result = {};

        const fontsPlugin = new FontsStylePlugin(this.mediaPermalinkResolver, themeContract);
        const fontsRules = await fontsPlugin.contractToFontFaces();

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

    public async getStyleModelAsync(styleConfig: any): Promise<StyleModel> {
        const classNames = [];
        let variationStyle: Style;
        let key;

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (category === "instance") {
                const instanceClassName = categoryConfig.key || Utils.randomClassName();
                categoryConfig.key = instanceClassName;
                key = categoryConfig.key;
                variationStyle = await this.getVariationStyle(categoryConfig, instanceClassName);

                const instanceClassNames = await this.getVariationClassNames(categoryConfig, instanceClassName);
                instanceClassNames.forEach(x => classNames.push(x));
            }
            else {
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

        }

        const result: StyleModel = {
            key: key,
            classNames: classNames.join(" "),
            css: await this.jssToCss(variationStyle)
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

    public jssToCss?(style: Style): string {
        if (!style) {
            return "";
        }

        const styleSheetC = new StyleSheet();
        styleSheetC.styles.push(style);

        const jssString = styleSheetC.toJssString();
        const jssObject = JSON.parse(jssString);

        const styleSheet = jss.createStyleSheet(jssObject);
        return styleSheet.toString();
    }
}