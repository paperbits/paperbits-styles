import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { SizeStylePluginConfig } from "./sizeContract";


export class SizeStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: SizeStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

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

        return result;
    }
}