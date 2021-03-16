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

        rules.push(new StyleRule("position", this.parseValue(pluginConfig.position)));

        if (pluginConfig.top !== undefined) {
            rules.push(new StyleRule("top", this.parseValue(pluginConfig.top)));
        }

        if (pluginConfig.left !== undefined) {
            rules.push(new StyleRule("left", this.parseValue(pluginConfig.left)));
        }

        if (pluginConfig.right !== undefined) {
            rules.push(new StyleRule("right", this.parseValue(pluginConfig.right)));
        }

        if (pluginConfig.bottom !== undefined) {
            rules.push(new StyleRule("bottom", this.parseValue(pluginConfig.bottom)));
        }

        if (pluginConfig.zIndex !== undefined) {
            rules.push(new StyleRule("z-index", pluginConfig.zIndex));
        }

        return rules;
    }
}