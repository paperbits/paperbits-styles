import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        if (pluginConfig.top) {
            rules.push(new StyleRule("marginTop", this.parseValue(pluginConfig.top)));
        }

        if (pluginConfig.left) {
            rules.push(new StyleRule("marginLeft", this.parseValue(pluginConfig.left)));
        }

        if (pluginConfig.right) {
            rules.push(new StyleRule("marginRight", this.parseValue(pluginConfig.right)));
        }

        if (pluginConfig.bottom) {
            rules.push(new StyleRule("marginBottom", this.parseValue(pluginConfig.bottom)));
        }

        return rules;
    }
}