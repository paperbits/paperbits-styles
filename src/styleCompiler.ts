import * as Utils from "@paperbits/common/utils";
import { Bag } from "@paperbits/common";
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
import { ThemeContract, BoxContract } from "./contracts";


const opts = preset();

opts.createGenerateClassName = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);




export class StyleCompiler {
    public plugins: Bag<StylePlugin>;

    constructor(private readonly themeContract: ThemeContract) {
        this.plugins = {};
        this.plugins["padding"] = new PaddingStylePlugin();
        this.plugins["margin"] = new MarginStylePlugin();
        this.plugins["border"] = new BorderStylePlugin();
        this.plugins["borderRadius"] = new BorderRadiusStylePlugin();
        this.plugins["background"] = new BackgroundStylePlugin(this.themeContract);
        this.plugins["shadow"] = new ShadowStylePlugin(this.themeContract);
        this.plugins["animation"] = new AnimationStylePlugin(this.themeContract);
        this.plugins["typography"] = new TypographyStylePlugin(this.themeContract);
        this.plugins["components"] = new ComponentsStylePlugin(this);
    }

    /**
     * Returns compliled CSS.
     */
    public compile(): string {
        const globals = {};
        const result = {
            "@global": globals
        };

        const fontsPlugin = new FontsStylePlugin(this.themeContract);
        const fontsRules = fontsPlugin.compile();
        Object.assign(result, fontsRules);

        Object.keys(this.themeContract.components).forEach(componentName => {
            const componentConfig = this.themeContract.components[componentName];

            Object.keys(componentConfig).forEach(variationName => {
                let className = `${componentName}-${variationName}`;
                className = className.replaceAll("-default", "");
                result[className] = {};

                if (variationName !== "default") {
                    result[className]["extend"] = `${componentName}`;
                }

                const pluginRules = this.getVariationRules(componentConfig[variationName]);
                Object.assign(result[className], pluginRules);
            });
        });

        Object.keys(this.themeContract.globals).forEach(tagName => {
            globals[tagName] = {};

            const pluginRules = this.getVariationRules(this.themeContract.globals[tagName]);

            Object.assign(globals[tagName], pluginRules);
        });

        const styleSheet = jss.createStyleSheet(result);

        return styleSheet.toString();
    }

    public getVariationRules(componentVariationConfig): Object {
        const result = {};

        Object.keys(componentVariationConfig).forEach(pluginName => {
            const plugin = this.plugins[pluginName];

            if (plugin) {
                const pluginRules = plugin.compile(componentVariationConfig[pluginName]);
                Object.assign(result, pluginRules);
            }
        });

        return result;
    }

    public getFontsStyles(): string {
        const result = {};

        const fontsPlugin = new FontsStylePlugin(this.themeContract);
        const fontsRules = fontsPlugin.compile();

        Object.assign(result, fontsRules);

        const styleSheet = jss.createStyleSheet(result);

        return styleSheet.toString();
    }
}