import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { BorderRadiusStylePluginConfig } from "../../contracts";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async configToStyleRules(pluginConfig: BorderRadiusStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (!this.isValueEmpty(pluginConfig.topLeftRadius)) {
            result.push(new StyleRule("borderTopLeftRadius", this.parseValue(pluginConfig.topLeftRadius)));
        }

        if (!this.isValueEmpty(pluginConfig.topRightRadius)) {
            result.push(new StyleRule("borderTopRightRadius", this.parseValue(pluginConfig.topRightRadius)));
        }

        if (!this.isValueEmpty(pluginConfig.bottomLeftRadius)) {
            result.push(new StyleRule("borderBottomLeftRadius", this.parseValue(pluginConfig.bottomLeftRadius)));
        }

        if (!this.isValueEmpty(pluginConfig.bottomRightRadius)) {
            result.push(new StyleRule("borderBottomRightRadius", this.parseValue(pluginConfig.bottomRightRadius)));
        }

        return result;
    }
}