import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { BorderRadiusStylePluginConfig } from "../../contracts";
import { StyleHelper } from "../../styleHelper";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async configToStyleRules(pluginConfig: BorderRadiusStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (!StyleHelper.isValueEmpty(pluginConfig.topLeftRadius)) {
            result.push(new StyleRule("borderTopLeftRadius", StyleHelper.parseValue(pluginConfig.topLeftRadius)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.topRightRadius)) {
            result.push(new StyleRule("borderTopRightRadius", StyleHelper.parseValue(pluginConfig.topRightRadius)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.bottomLeftRadius)) {
            result.push(new StyleRule("borderBottomLeftRadius", StyleHelper.parseValue(pluginConfig.bottomLeftRadius)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.bottomRightRadius)) {
            result.push(new StyleRule("borderBottomRightRadius", StyleHelper.parseValue(pluginConfig.bottomRightRadius)));
        }

        return result;
    }
}