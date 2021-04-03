import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { PaddingStylePluginConfig } from ".";
import { StyleHelper } from "../../styleHelper";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(pluginConfig: PaddingStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        if (!StyleHelper.isValueEmpty(pluginConfig.top)) {
            rules.push(new StyleRule("paddingTop", StyleHelper.parseValue(pluginConfig.top)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.left)) {
            rules.push(new StyleRule("paddingLeft", StyleHelper.parseValue(pluginConfig.left)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.right)) {
            rules.push(new StyleRule("paddingRight", StyleHelper.parseValue(pluginConfig.right)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.bottom)) {
            rules.push(new StyleRule("paddingBottom", StyleHelper.parseValue(pluginConfig.bottom)));
        }

        return rules;
    }
}
