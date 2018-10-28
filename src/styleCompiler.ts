import { IBag } from "@paperbits/common";
import jss from "jss";
import preset from "jss-preset-default";


const opts = preset();

opts.createGenerateClassName = () => {
    return (rule, sheet) => {
        return `${rule.key}`;
    };
};

jss.setup(opts);


export abstract class StylePlugin {
    public displayName: string;

    public abstract compile(contract): any;
}

export interface Theme {
    components: Object;
}

export interface PaddingContract {
    top: string;
    left: string;
    right: string;
    bottom: string;
}

export interface MarginContract {
    top: string;
    left: string;
    right: string;
    bottom: string;
}

export interface BorderStyleContract {
    width: string;
    style: string;
    color: string;
}

export interface BorderContract {
    top: BorderStyleContract;
    left: BorderStyleContract;
    right: BorderStyleContract;
    bottom: BorderStyleContract;
}

export class PaddingStylePlugin extends StylePlugin {
    public displayName = "Padding";

    public compile(contract: PaddingContract): Object {
        return {
            paddingTop: contract.top,
            paddingLeft: contract.left,
            paddingRight: contract.right,
            paddingBottom: contract.bottom
        };
    }
}

export class MarginStylePlugin extends StylePlugin {
    public displayName = "Margin";

    public compile(contract: MarginContract): Object {
        return {
            marginTop: contract.top,
            marginLeft: contract.left,
            marginRight: contract.right,
            marginBottom: contract.bottom
        };
    }
}

export class BorderStylePlugin extends StylePlugin {
    public displayName = "Border";

    public compile(contract: BorderContract): Object {
        const result = {
            borderTop: contract.top ? [contract.top.width, contract.top.style, contract.top.color] : "none",
            borderLeft: contract.left ? [contract.left.width, contract.left.style, contract.left.color] : "none",
            borderRight: contract.right ? [contract.right.width, contract.right.style, contract.right.color] : "none",
            borderBottom: contract.bottom ? [contract.bottom.width, contract.bottom.style, contract.bottom.color] : "none",
        };

        return result;
    }
}

export class StyleCompiler {
    private plugins: IBag<StylePlugin>;

    constructor() {
        this.plugins = {};
        this.plugins["padding"] = new PaddingStylePlugin();
        this.plugins["margin"] = new MarginStylePlugin();
        this.plugins["border"] = new BorderStylePlugin();
    }

    public compile(config: Theme): Object {
        const result = {};

        Object.keys(config.components).forEach(componentName => {
            result[componentName] = {};
            const componentRules = this.getComponentRules(config.components[componentName]);
            Object.assign(result[componentName], componentRules);
        });

        return jss.createStyleSheet(result).toString();
    }

    private getComponentRules(componentConfig): Object {
        const result = {};

        Object.keys(componentConfig).forEach(pluginName => {
            const pluginRules = this.getPluginRules(pluginName, componentConfig[pluginName]);
            Object.assign(result, pluginRules);
        });

        return result;
    }

    private getPluginRules(pluginName, pluginConfig): Object {
        const plugin = this.plugins[pluginName];
        return plugin.compile(pluginConfig);
    }
}