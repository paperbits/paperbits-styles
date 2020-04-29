import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        result.push(new StyleRule("marginTop", StylePlugin.parseSize(pluginConfig.top)));
        result.push(new StyleRule("marginLeft", StylePlugin.parseSize(pluginConfig.left)));
        result.push(new StyleRule("marginRight", StylePlugin.parseSize(pluginConfig.right)));
        result.push(new StyleRule("marginBottom", StylePlugin.parseSize(pluginConfig.bottom)));

        return result;
    }
}