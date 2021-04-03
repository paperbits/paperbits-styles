import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { MarginStylePluginConfig } from "../../contracts";
import { StyleHelper } from "../../styleHelper";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(pluginConfig: MarginStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        if (!StyleHelper.isValueEmpty(pluginConfig.top)) {
            rules.push(new StyleRule("marginTop", StyleHelper.parseValue(pluginConfig.top)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.left)) {
            rules.push(new StyleRule("marginLeft", StyleHelper.parseValue(pluginConfig.left)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.right)) {
            rules.push(new StyleRule("marginRight", StyleHelper.parseValue(pluginConfig.right)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.bottom)) {
            rules.push(new StyleRule("marginBottom", StyleHelper.parseValue(pluginConfig.bottom)));
        }

        return rules;
    }
}