import * as Utils from "@paperbits/common/utils";
import { StyleService } from "./styleService";
import { Bag } from "@paperbits/common";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
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
    ComponentsStylePlugin
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
        private readonly permalinkResolver: IPermalinkResolver,
    ) {
        this.plugins = {};

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
        this.plugins["background"] = new BackgroundStylePlugin(this.styleService, this.permalinkResolver);
        this.plugins["shadow"] = new ShadowStylePlugin(themeContract);
        this.plugins["animation"] = new AnimationStylePlugin(themeContract);
        this.plugins["typography"] = new TypographyStylePlugin(themeContract);
        this.plugins["components"] = new ComponentsStylePlugin(this);

        const globals = {};
        const result = {
            "@global": globals
        };

        const fontsPlugin = new FontsStylePlugin(themeContract);
        const fontsRules = await fontsPlugin.contractToJss();
        Object.assign(result, fontsRules);

        if (themeContract.components) {
            for (const componentName of Object.keys(themeContract.components)) {
                const componentConfig = themeContract.components[componentName];

                for (const variationName of Object.keys(componentConfig)) {
                    const className = `${componentName}-${variationName}`.replaceAll("-default", "");
                    result[className] = {};

                    const pluginRules = await this.getVariationRules(componentConfig[variationName]);
                    Object.assign(result[className], pluginRules);
                }
            }
        }

        if (themeContract.instances) {
            for (const instanceName of Object.keys(themeContract.instances)) {
                const componentConfig = themeContract.instances[instanceName];

                const className = `${instanceName}`;
                result[className] = {};

                const pluginRules = await this.getVariationRules(componentConfig);
                Object.assign(result[className], pluginRules);
            }
        }

        if (themeContract.globals) {
            for (const tagName of Object.keys(themeContract.globals)) {
                globals[tagName] = {};

                const pluginRules = await this.getVariationRules(themeContract.globals[tagName]);

                Object.assign(globals[tagName], pluginRules);
            }
        }

        const styleSheet = jss.createStyleSheet(result);

        return styleSheet.toString();
    }

    public async getVariationRules(componentVariationConfig): Promise<object> {
        const result = {};

        for (const pluginName of Object.keys(componentVariationConfig)) {
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginRules = await plugin.contractToJss(componentVariationConfig[pluginName]);
                Object.assign(result, pluginRules);
            }
        }

        return result;
    }

    public async getFontsStyles(): Promise<string> {
        const themeContract = await this.styleService.getStyles();
        const result = {};

        const fontsPlugin = new FontsStylePlugin(themeContract);
        const fontsRules = await fontsPlugin.contractToJss();

        Object.assign(result, fontsRules);

        const styleSheet = jss.createStyleSheet(result);

        return styleSheet.toString();
    }
}