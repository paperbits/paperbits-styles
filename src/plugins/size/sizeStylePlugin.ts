import { StyleRule } from "@paperbits/common/styles";
import { StyleHelper } from "../../styleHelper";
import { StylePlugin } from "../stylePlugin";
import { SizeStylePluginConfig } from "./sizeStylePluginConfig";


export class SizeStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: SizeStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (!StyleHelper.isValueEmpty(pluginConfig.width)) {
            result.push(new StyleRule("width", StyleHelper.parseValue(pluginConfig.width)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.height)) {
            result.push(new StyleRule("height", StyleHelper.parseValue(pluginConfig.height)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.minWidth)) {
            result.push(new StyleRule("minWidth", StyleHelper.parseValue(pluginConfig.minWidth)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.minHeight)) {
            result.push(new StyleRule("minHeight", StyleHelper.parseValue(pluginConfig.minHeight)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.maxWidth)) {
            result.push(new StyleRule("maxWidth", StyleHelper.parseValue(pluginConfig.maxWidth)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.maxHeight)) {
            result.push(new StyleRule("maxHeight", StyleHelper.parseValue(pluginConfig.maxHeight)));
        }

        if (pluginConfig.stretch) {
            result.push(new StyleRule("flexGrow", 1));
        }

        return result;
    }
}