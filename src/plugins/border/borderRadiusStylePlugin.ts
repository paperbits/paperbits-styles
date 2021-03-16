import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { BorderRadiusStylePluginConfig } from "../../contracts";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async configToStyleRules(pluginConfig: BorderRadiusStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("borderTopLeftRadius", this.parseValue(pluginConfig.topLeftRadius)),
            new StyleRule("borderTopRightRadius", this.parseValue(pluginConfig.topRightRadius)),
            new StyleRule("borderBottomLeftRadius", this.parseValue(pluginConfig.bottomLeftRadius)),
            new StyleRule("borderBottomRightRadius", this.parseValue(pluginConfig.bottomRightRadius))
        ];

        return result;
    }
}