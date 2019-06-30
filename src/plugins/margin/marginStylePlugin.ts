import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("marginTop", StylePlugin.parseSize(pluginConfig.top)),
            new StyleRule("marginLeft", StylePlugin.parseSize(pluginConfig.left)),
            new StyleRule("marginRight", StylePlugin.parseSize(pluginConfig.right)),
            new StyleRule("marginBottom", StylePlugin.parseSize(pluginConfig.bottom))
        ];

        return result;
    }
}