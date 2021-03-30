import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { PaddingStylePluginConfig } from ".";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(pluginConfig: PaddingStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        if (!this.isValueEmpty(pluginConfig.top)) {
            rules.push(new StyleRule("paddingTop", this.parseValue(pluginConfig.top)));
        }

        if (!this.isValueEmpty(pluginConfig.left)) {
            rules.push(new StyleRule("paddingLeft", this.parseValue(pluginConfig.left)));
        }

        if (!this.isValueEmpty(pluginConfig.right)) {
            rules.push(new StyleRule("paddingRight", this.parseValue(pluginConfig.right)));
        }

        if (!this.isValueEmpty(pluginConfig.bottom)) {
            rules.push(new StyleRule("paddingBottom", this.parseValue(pluginConfig.bottom)));
        }

        return rules;
    }
}
