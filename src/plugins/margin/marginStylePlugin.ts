import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("marginTop", StylePlugin.parseSize(pluginConfig.top, "auto")),
            new StyleRule("marginLeft", StylePlugin.parseSize(pluginConfig.left, "auto")),
            new StyleRule("marginRight", StylePlugin.parseSize(pluginConfig.right, "auto")),
            new StyleRule("marginBottom", StylePlugin.parseSize(pluginConfig.bottom, "auto"))
        ];

        return result;
    }
}