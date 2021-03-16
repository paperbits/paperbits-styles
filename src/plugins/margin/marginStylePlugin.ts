import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        result.push(new StyleRule("marginTop", this.parseValue(pluginConfig.top, "auto")));
        result.push(new StyleRule("marginLeft", this.parseValue(pluginConfig.left, "auto")));
        result.push(new StyleRule("marginRight", this.parseValue(pluginConfig.right, "auto")));
        result.push(new StyleRule("marginBottom", this.parseValue(pluginConfig.bottom, "auto")));

        return result;
    }
}