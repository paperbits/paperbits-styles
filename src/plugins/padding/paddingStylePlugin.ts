import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { PaddingStylePluginConfig } from ".";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(pluginConfig: PaddingStylePluginConfig): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("paddingTop", this.parseValue(pluginConfig.top)),
            new StyleRule("paddingLeft", this.parseValue(pluginConfig.left)),
            new StyleRule("paddingRight", this.parseValue(pluginConfig.right)),
            new StyleRule("paddingBottom", this.parseValue(pluginConfig.bottom))
        ];

        return rules;
    }
}
