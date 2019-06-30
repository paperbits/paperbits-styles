import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { BorderRadiusStylePluginConfig } from "../../contracts";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async configToStyleRules(pluginConfig: BorderRadiusStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("borderTopLeftRadius", StylePlugin.parseSize(pluginConfig.topLeftRadius)),
            new StyleRule("borderTopRightRadius", StylePlugin.parseSize(pluginConfig.topRightRadius)),
            new StyleRule("borderBottomLeftRadius", StylePlugin.parseSize(pluginConfig.bottomLeftRadius)),
            new StyleRule("borderBottomRightRadius", StylePlugin.parseSize(pluginConfig.bottomRightRadius))
        ];

        return result;
    }
}