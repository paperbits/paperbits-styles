import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { formatUnicode } from "./styleUitls";
import { StyleService } from "./styleService";
import { Bag } from "@paperbits/common";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { BreakpointValues } from "@paperbits/common/styles/breakpoints";
import {
    StylePlugin,
    FontsStylePlugin,
    MarginStylePlugin,
    BorderStylePlugin,
    BorderRadiusStylePlugin,
    BackgroundStylePlugin,
    ShadowStylePlugin,
    AnimationStylePlugin,
    TypographyStylePlugin,
    ListStylePlugin,
    ComponentsStylePlugin,
    StatesStylePlugin,
    ContainerStylePlugin,
    SizeStylePlugin,
    TransitionStylePlugin,
    PositionStylePlugin,
    StickToStylePlugin,
    PaddingStylePlugin,
    TransformStylePlugin
} from "./plugins";
import { GridStylePlugin } from "./plugins/grid/gridStylePlugin";
import { GridCellStylePlugin } from "./plugins/grid/gridCellStylePlugin";
import {
    Style,
    StyleSheet,
    StyleManager,
    StyleMediaQuery,
    StyleCompiler,
    StyleModel,
    StyleRule,
    VariationBagContract,
    StateBagContract,
    LocalStyles,
    PluginBag
} from "@paperbits/common/styles";
import { JssCompiler } from "./jssCompiler";
import { ThemeContract } from "./contracts/themeContract";
import { IconsFontFamilyName, IconsFontStyleName, IconsFontWeight } from "./constants";


export class DefaultStyleCompiler implements StyleCompiler {
    private styles: ThemeContract;
    public readonly plugins: Bag<StylePlugin>;

    constructor(
        private readonly styleService: StyleService,
        private readonly permalinkResolver: IPermalinkResolver
    ) {
        this.plugins = {};
    }

    private isResponsive(variation: Object): boolean {
        if (!variation) {
            throw new Error(`Parameter "variation" not specified.`);
        }

        return Object.keys(variation).some(props => Object.keys(BreakpointValues).includes(props));
    }

    public setStyles(styles: ThemeContract): void {
        this.styles = styles;
    }

    private async getStyles(): Promise<ThemeContract> {
        if (!this.styles && !this.styleService) {
            console.error("Styles provider is not set!");
        }

        const result = this.styles || await this.styleService.getStyles();
        Objects.cleanupObject(result, true);

        return result;
    }

    private pluginsToRefresh: string[] = ["border", "background", "shadow", "animation", "typography"];

    private async initializePlugins(): Promise<void> {
        const themeContract = await this.getStyles();

        if (Object.keys(this.plugins).length > 0) {
            if (themeContract) {
                this.pluginsToRefresh.map(pluginName => {
                    const plugin = this.plugins[pluginName];

                    if (plugin.setThemeContract) {
                        plugin.setThemeContract(themeContract);
                    }
                    else {
                        console.error(`Plugin ${pluginName} does not support setThemeContract`);
                    }
                });
            }
            return;
        }

        this.plugins["padding"] = new PaddingStylePlugin();
        this.plugins["margin"] = new MarginStylePlugin();
        this.plugins["border"] = new BorderStylePlugin();
        this.plugins["borderRadius"] = new BorderRadiusStylePlugin();
        this.plugins["background"] = new BackgroundStylePlugin(this.permalinkResolver);
        this.plugins["shadow"] = new ShadowStylePlugin();
        this.plugins["animation"] = new AnimationStylePlugin();
        this.plugins["typography"] = new TypographyStylePlugin();
        this.plugins["list"] = new ListStylePlugin();
        this.plugins["components"] = new ComponentsStylePlugin(this);
        this.plugins["states"] = new StatesStylePlugin(this);
        this.plugins["grid"] = new GridStylePlugin();
        this.plugins["grid-cell"] = new GridCellStylePlugin();
        this.plugins["container"] = new ContainerStylePlugin();
        this.plugins["size"] = new SizeStylePlugin();
        this.plugins["transform"] = new TransformStylePlugin();
        this.plugins["transition"] = new TransitionStylePlugin();
        this.plugins["position"] = new PositionStylePlugin();
        this.plugins["stickTo"] = new StickToStylePlugin();
    }

    public async getStyleSheet(): Promise<StyleSheet> {
        await this.initializePlugins();

        const styleSheet = new StyleSheet("global");
        const themeContract = await this.getStyles();
        const fontsPlugin = new FontsStylePlugin(this.permalinkResolver, themeContract);
        const fontFaces = await fontsPlugin.contractToFontFaces();
        styleSheet.fontFaces.push(...fontFaces);

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

                styleSheet.styles.push(componentStyle);
            }
        }

        if (themeContract.utils) {
            for (const variationName of Object.keys(themeContract.utils.text)) {
                const textStyle = await this.getVariationStyle(themeContract.utils.text[variationName], "text", variationName, false, true);
                styleSheet.styles.push(textStyle);
            }

            for (const variationName of Object.keys(themeContract.utils.content)) {
                const contentStyle = await this.getVariationStyle(themeContract.utils.content[variationName], "content", variationName, false, true);
                styleSheet.styles.push(contentStyle);
            }
        }

        if (themeContract.globals) {
            for (const tagName of Object.keys(themeContract.globals)) {
                const tagConfig = themeContract.globals[tagName];

                const defaultComponentStyle = await this.getVariationStyle(tagConfig["default"], tagName, "default", true);
                const variations = Object.keys(tagConfig);

                if (!defaultComponentStyle && variations.length <= 1) {
                    continue;
                }

                const componentName = Utils.camelCaseToKebabCase(tagName === "body" ? "text" : tagName);

                for (const variationName of variations) {
                    if (variationName === "default") {
                        continue;
                    }

                    const variationStyle = await this.getVariationStyle(tagConfig[variationName], componentName, variationName, false);
                    styleSheet.styles.push(variationStyle);
                }

                styleSheet.globalStyles.push(defaultComponentStyle);
            }
        }

        if (themeContract.colors) {
            for (const colorName of Object.keys(themeContract.colors)) {
                const colorStyleSelector = `colors-${Utils.camelCaseToKebabCase(colorName)}`;
                const colorStyle = new Style(colorStyleSelector);
                colorStyle.addRule(new StyleRule("color", themeContract.colors[colorName].value));
                styleSheet.styles.push(colorStyle);
            }
        }

        if (themeContract.icons) {
            const iconBaseStyle = this.getIconFontStyle();
            styleSheet.styles.push(iconBaseStyle);

            const iconNames = Object.keys(themeContract.icons);

            for (const iconName of iconNames) {
                const icon = themeContract.icons[iconName];
                const formattedUnicode = formatUnicode(icon.unicode);
                const iconStyleSelector = `icon-${Utils.camelCaseToKebabCase(iconName)}`;
                const iconStyle = new Style(iconStyleSelector);
                const pseudoStyle = new Style("before");

                pseudoStyle.addRule(new StyleRule("content", `'\\\\${formattedUnicode}'`));
                iconStyle.pseudoStyles.push(pseudoStyle);
                styleSheet.styles.push(iconStyle);
            }
        }

        return styleSheet;
    }

    /**
     * Returns compliled CSS.
     */
    public async compileCss(): Promise<string> {
        const styleSheet = await this.getStyleSheet();
        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);

        return css;
    }

    public async getVariationStyle(variationConfig: VariationBagContract, componentName: string, variationName: string = null, isGlobal: boolean = false, useBreakpointInSelector: boolean = false): Promise<Style> {
        await this.initializePlugins();

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
                continue;
            }

            const pluginConfig = variationConfig[pluginName];

            if (!this.isResponsive(pluginConfig)) {
                const rules = await plugin.configToStyleRules(pluginConfig);
                resultStyle.addRules(rules);

                const pseudoStyles = await plugin.configToPseudoStyles(pluginConfig);
                resultStyle.pseudoStyles.push(...pseudoStyles);

                const nestedStyles = await plugin.configToNestedStyles(pluginConfig);

                if (isGlobal) {
                    resultStyle.nestedGlobalStyles.push(...nestedStyles);
                }
                else {
                    resultStyle.nestedStyles.push(...nestedStyles);
                }

                resultStyle.nestedStyles.push(...nestedStyles);

                continue;
            }

            /* Processing responsive styles */
            for (const breakpoint of Object.keys(BreakpointValues)) {
                const breakpointConfig = pluginConfig[breakpoint];

                if (!breakpointConfig) {
                    continue;
                }

                if (breakpoint === "xs") { // No need media query
                    const pluginRules = await plugin.configToStyleRules(breakpointConfig);
                    resultStyle.addRules(pluginRules);

                    const pseudoStyles = await plugin.configToPseudoStyles(breakpointConfig);
                    resultStyle.pseudoStyles.push(...pseudoStyles);

                    const nestedStyles = await plugin.configToNestedStyles(breakpointConfig);
                    resultStyle.nestedStyles.push(...nestedStyles);
                    continue;
                }

                const breakpointSegment = useBreakpointInSelector ? `-${breakpoint}` : "";

                const selector = isGlobal
                    ? componentName
                    : `${componentName}${breakpointSegment}-${variationName}`.replace("-default", "");


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

                const pluginRules = await plugin.configToStyleRules(breakpointConfig);
                style.rules.push(...pluginRules);

                const pseudoStyles = await plugin.configToPseudoStyles(breakpointConfig);
                style.pseudoStyles.push(...pseudoStyles);

                const nestedStyles = await plugin.configToNestedStyles(breakpointConfig);
                style.nestedStyles.push(...nestedStyles);
            }
        }

        return resultStyle;
    }

    public getVariationClassNames(variations: VariationBagContract, componentName: string, variationName: string = null): string[] {
        const classNames = [];

        if (!variationName) {
            variationName = "default";
        }

        for (const pluginName of Object.keys(variations)) {
            const pluginConfig = variations[pluginName];

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

    public async getStateStyle(states: StateBagContract, stateName: string): Promise<Style> {
        const stateStyle = new Style(stateName);

        for (const pluginName of Object.keys(states)) {
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginConfig = states[pluginName];

                const pluginRules = await plugin.configToStyleRules(pluginConfig);
                stateStyle.addRules(pluginRules);

                const nestedStyles = await plugin.configToNestedStyles(pluginConfig);
                stateStyle.nestedStyles.push(...nestedStyles);
            }
        }

        return stateStyle;
    }

    private getIconFontStyle(): Style {
        const iconBaseStyle = new Style("icon");
        iconBaseStyle.addRule(new StyleRule("display", `inline-block`));
        iconBaseStyle.addRule(new StyleRule("font-family", IconsFontFamilyName));
        iconBaseStyle.addRule(new StyleRule("font-style", IconsFontStyleName));
        iconBaseStyle.addRule(new StyleRule("font-weight", IconsFontWeight));
        iconBaseStyle.addRule(new StyleRule("font-size", "1em"));
        iconBaseStyle.addRule(new StyleRule("vertical-align", "middle"));
        iconBaseStyle.addRule(new StyleRule("speak", "none"));
        iconBaseStyle.addRule(new StyleRule("text-transform", "none"));
        iconBaseStyle.addRule(new StyleRule("-webkit-font-smoothing", "antialiased"));
        iconBaseStyle.addRule(new StyleRule("-moz-osx-font-smoothing", "grayscale"));

        return iconBaseStyle;
    }

    public async getIconFontStylesCss(): Promise<string> {
        const themeContract = await this.getStyles();
        const fontsPlugin = new FontsStylePlugin(this.permalinkResolver, themeContract);
        const fontFaces = await fontsPlugin.contractToFontFaces();
        const iconFontFace = fontFaces.find(x => x.fontFamily === IconsFontFamilyName);

        const styleSheet = new StyleSheet();
        styleSheet.fontFaces.push(iconFontFace);

        const iconBaseStyle = this.getIconFontStyle();
        styleSheet.styles.push(iconBaseStyle);

        if (themeContract.icons) {
            const iconNames = Object.keys(themeContract.icons);

            for (const iconName of iconNames) {
                const icon = themeContract.icons[iconName];
                const formattedUnicode = formatUnicode(icon.unicode);
                const iconStyleSelector = `icon-${Utils.camelCaseToKebabCase(iconName)}`;
                const iconStyle = new Style(iconStyleSelector);
                const pseudoStyle = new Style("before");

                pseudoStyle.addRule(new StyleRule("content", `'\\\\${formattedUnicode}'`));
                iconStyle.pseudoStyles.push(pseudoStyle);
                styleSheet.styles.push(iconStyle);
            }
        }

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);

        return css;
    }

    public async getFontsStylesCss(): Promise<string> {
        const themeContract = await this.getStyles();
        const fontsPlugin = new FontsStylePlugin(this.permalinkResolver, themeContract);
        const fontFaces = await fontsPlugin.contractToFontFaces();

        const styleSheet = new StyleSheet();
        styleSheet.fontFaces.push(...fontFaces);

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);

        return css;
    }

    public getClassNameByColorKey(colorKey: string): string {
        return Utils.camelCaseToKebabCase(colorKey.replaceAll("/", "-"));
    }

    public async getClassNamesForLocalStylesAsync(styleConfig: LocalStyles): Promise<string> {
        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (!categoryConfig) {
                continue;
            }

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
                continue;
            }

            const styleKey = <string>categoryConfig;
            const className = await this.getClassNameByStyleKeyAsync(styleKey);

            if (className) {
                classNames.push(className);
            }
        }

        return classNames.join(" ");
    }

    public async getStyleModelAsync(localStyles: LocalStyles, styleManager: StyleManager): Promise<StyleModel> {
        const classNames = [];
        let variationStyle: Style;
        let key;

        for (const category of Object.keys(localStyles)) {
            const categoryConfig = localStyles[category];

            if (!categoryConfig) {
                continue;
            }

            if (category === "instance") {
                const pluginBag = <PluginBag>categoryConfig;
                const instanceClassName = pluginBag.key || Utils.randomClassName();
                pluginBag.key = instanceClassName;
                key = pluginBag.key;

                variationStyle = await this.getVariationStyle(pluginBag, instanceClassName);

                const instanceClassNames = await this.getVariationClassNames(pluginBag, instanceClassName);
                classNames.push(...instanceClassNames);
            }
            else {
                if (this.isResponsive(categoryConfig)) {
                    const pluginBag = <PluginBag>categoryConfig;

                    for (const breakpoint of Object.keys(pluginBag)) {
                        let className;

                        if (breakpoint === "xs") {
                            className = await this.getClassNameByStyleKeyAsync(pluginBag[breakpoint]);
                        }
                        else {
                            className = await this.getClassNameByStyleKeyAsync(pluginBag[breakpoint], breakpoint);
                        }

                        if (className) {
                            classNames.push(className);
                        }
                    }
                }
                else {
                    const styleKey = <string>categoryConfig;

                    const className = await this.getClassNameByStyleKeyAsync(styleKey);

                    if (className) {
                        classNames.push(className);
                    }
                }
            }
        }

        const localStyleSheet = new StyleSheet(key);

        if (variationStyle) {
            localStyleSheet.styles.push(variationStyle);
        }

        const result: StyleModel = {
            key: key,
            classNames: classNames.join(" "),
            styleSheet: localStyleSheet,
            styleManager: styleManager
        };

        return result;
    }

    public async getClassNameByStyleKeyAsync(key: string, breakpoint?: string): Promise<string> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        const segments = key.split("/");

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
        const style: VariationBagContract = await this.styleService.getStyleByKey(key);

        if (style?.class) {
            classNames.push(style.class[breakpoint || "xs"]);
        }

        return classNames.join(" ");
    }

    public styleToCss(style: Style): string {
        if (!style) {
            return "";
        }

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);
        return css;
    }
}