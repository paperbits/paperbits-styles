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
            result.push(new StyleRule("width", this.parseValue(pluginConfig.width)));
        }

        if (pluginConfig.height) {
            result.push(new StyleRule("height", this.parseValue(pluginConfig.height)));
        }

        if (pluginConfig.minWidth) {
            result.push(new StyleRule("minWidth", this.parseValue(pluginConfig.minWidth)));
        }

        if (pluginConfig.minHeight) {
            result.push(new StyleRule("minHeight", this.parseValue(pluginConfig.minHeight)));
        }

        if (pluginConfig.maxWidth) {
            result.push(new StyleRule("maxWidth", this.parseValue(pluginConfig.maxWidth)));
        }

        if (pluginConfig.maxHeight) {
            result.push(new StyleRule("maxHeight", this.parseValue(pluginConfig.maxHeight)));
        }

        if (pluginConfig.stretch) {
            result.push(new StyleRule("flexGrow", 1));
        }

        return result;
    }
}