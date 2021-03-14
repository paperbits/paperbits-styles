import { StylePlugin } from "../stylePlugin";
import { ThemeContract } from "../../contracts";
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

        if (pluginConfig.top) {
            rules.push(new StyleRule("top", pluginConfig.top));
        }

        if (pluginConfig.left) {
            rules.push(new StyleRule("left", pluginConfig.left));
        }

        if (pluginConfig.right) {
            rules.push(new StyleRule("right", pluginConfig.right));
        }

        if (pluginConfig.bottom) {
            rules.push(new StyleRule("bottom", pluginConfig.bottom));
        }

        if (pluginConfig.zIndex) {
            rules.push(new StyleRule("z-index", pluginConfig.zIndex));
        }

        return rules;
    }
}