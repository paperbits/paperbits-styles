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

        rules.push(new StyleRule("position", StylePlugin.parseSize(pluginConfig.position)));

        if (pluginConfig.top !== undefined) {
            rules.push(new StyleRule("top", StylePlugin.parseSize(pluginConfig.top)));
        }

        if (pluginConfig.left !== undefined) {
            rules.push(new StyleRule("left", StylePlugin.parseSize(pluginConfig.left)));
        }

        if (pluginConfig.right !== undefined) {
            rules.push(new StyleRule("right", StylePlugin.parseSize(pluginConfig.right)));
        }

        if (pluginConfig.bottom !== undefined) {
            rules.push(new StyleRule("bottom", StylePlugin.parseSize(pluginConfig.bottom)));
        }

        if (pluginConfig.zIndex !== undefined) {
            rules.push(new StyleRule("z-index", pluginConfig.zIndex));
        }

        return rules;
    }
}