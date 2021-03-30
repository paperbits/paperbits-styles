import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { PositionStylePluginConfig } from "./positionStylePluginConfig";

export class PositionStylePlugin extends StylePlugin {
    public readonly name: string = "position";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: PositionStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];

        rules.push(new StyleRule("position", pluginConfig.position));

        if (!this.isValueEmpty(pluginConfig.top)) {
            rules.push(new StyleRule("top", this.parseValue(pluginConfig.top)));
        }

        if (!this.isValueEmpty(pluginConfig.left)) {
            rules.push(new StyleRule("left", this.parseValue(pluginConfig.left)));
        }

        if (!this.isValueEmpty(pluginConfig.right)) {
            rules.push(new StyleRule("right", this.parseValue(pluginConfig.right)));
        }

        if (!this.isValueEmpty(pluginConfig.bottom)) {
            rules.push(new StyleRule("bottom", this.parseValue(pluginConfig.bottom)));
        }

        if (!this.isValueEmpty(pluginConfig.zIndex)) {
            rules.push(new StyleRule("z-index", pluginConfig.zIndex));
        }

        return rules;
    }
}