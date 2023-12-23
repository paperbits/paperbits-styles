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
        const rules = [];

        if (pluginConfig.fit) {
            rules.push(new StyleRule("position", "absolute"));
            rules.push(new StyleRule("top", "0"));
            rules.push(new StyleRule("left", "0"));
            rules.push(new StyleRule("right", "0"));
            rules.push(new StyleRule("bottom", "0"));
            rules.push(new StyleRule("zIndex", "100"));
            rules.push(new StyleRule("overflow", "auto"));
            return rules;
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.width)) {
            rules.push(new StyleRule("width", StyleHelper.parseValue(pluginConfig.width)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.height)) {
            rules.push(new StyleRule("height", StyleHelper.parseValue(pluginConfig.height)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.minWidth)) {
            rules.push(new StyleRule("minWidth", StyleHelper.parseValue(pluginConfig.minWidth)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.minHeight)) {
            rules.push(new StyleRule("minHeight", StyleHelper.parseValue(pluginConfig.minHeight)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.maxWidth)) {
            rules.push(new StyleRule("maxWidth", StyleHelper.parseValue(pluginConfig.maxWidth)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.maxHeight)) {
            rules.push(new StyleRule("maxHeight", StyleHelper.parseValue(pluginConfig.maxHeight)));
        }

        if (pluginConfig.stretch) {
            rules.push(new StyleRule("flexGrow", 1));
        }

        return rules;
    }
}