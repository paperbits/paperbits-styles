import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { PaddingStylePluginConfig } from "../contracts";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(pluginConfig: PaddingStylePluginConfig): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("paddingTop", StylePlugin.parseSize(pluginConfig.top)),
            new StyleRule("paddingLeft", StylePlugin.parseSize(pluginConfig.left)),
            new StyleRule("paddingRight", StylePlugin.parseSize(pluginConfig.right)),
            new StyleRule("paddingBottom", StylePlugin.parseSize(pluginConfig.bottom))
        ];

        return rules;
    }
}
