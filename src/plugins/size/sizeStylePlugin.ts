import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { SizeStylePluginConfig } from "./sizeStylePluginConfig";


export class SizeStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: SizeStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (pluginConfig.width) {
            result.push(new StyleRule("width", StylePlugin.parseSize(pluginConfig.width)));
        }

        if (pluginConfig.height) {
            result.push(new StyleRule("height", StylePlugin.parseSize(pluginConfig.height)));
        }

        if (pluginConfig.minWidth) {
            result.push(new StyleRule("minWidth", StylePlugin.parseSize(pluginConfig.minWidth)));
        }

        if (pluginConfig.minHeight) {
            result.push(new StyleRule("minHeight", StylePlugin.parseSize(pluginConfig.minHeight)));
        }

        if (pluginConfig.maxWidth) {
            result.push(new StyleRule("maxWidth", StylePlugin.parseSize(pluginConfig.maxWidth)));
        }

        if (pluginConfig.maxHeight) {
            result.push(new StyleRule("maxHeight", StylePlugin.parseSize(pluginConfig.maxHeight)));
        }

        if (pluginConfig.stretch) {
            result.push(new StyleRule("flexGrow", 1));
        }

        return result;
    }
}