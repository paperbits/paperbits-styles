import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { PaddingStylePluginConfig } from ".";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(pluginConfig: PaddingStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        if (pluginConfig.top) {
            rules.push(new StyleRule("paddingTop", this.parseValue(pluginConfig.top)));
        }

        if (pluginConfig.left) {
            rules.push(new StyleRule("paddingLeft", this.parseValue(pluginConfig.left)));
        }

        if (pluginConfig.right) {
            rules.push(new StyleRule("paddingRight", this.parseValue(pluginConfig.right)));
        }
        
        if (pluginConfig.bottom) {
            rules.push(new StyleRule("paddingBottom", this.parseValue(pluginConfig.bottom)));
        }

        return rules;
    }
}
