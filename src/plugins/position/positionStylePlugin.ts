import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { PositionStylePluginConfig } from "./positionStylePluginConfig";
import { StyleHelper } from "../../styleHelper";

export class PositionStylePlugin extends StylePlugin {
    public readonly name: string = "position";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: PositionStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        rules.push(new StyleRule("position", pluginConfig.position));

        if (!StyleHelper.isValueEmpty(pluginConfig.top)) {
            rules.push(new StyleRule("top", StyleHelper.parseValue(pluginConfig.top)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.left)) {
            rules.push(new StyleRule("left", StyleHelper.parseValue(pluginConfig.left)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.right)) {
            rules.push(new StyleRule("right", StyleHelper.parseValue(pluginConfig.right)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.bottom)) {
            rules.push(new StyleRule("bottom", StyleHelper.parseValue(pluginConfig.bottom)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.zIndex)) {
            rules.push(new StyleRule("z-index", pluginConfig.zIndex));
        }

        return rules;
    }
}