import * as Objects from "@paperbits/common";
import { StylePlugin } from "../stylePlugin";
import { BorderStylePluginConfig, ColorContract, ThemeContract } from "../../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class BorderStylePlugin extends StylePlugin {
    public readonly name: string = "border";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async configToStyleRules(pluginConfig: BorderStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (pluginConfig.top && pluginConfig.top.width && pluginConfig.top.style && pluginConfig.top.colorKey) {
            const borderTopColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.top.colorKey, this.themeContract);
            result.push(new StyleRule("borderTop", `${StylePlugin.parseSize(pluginConfig.top.width)} ${pluginConfig.top.style} ${borderTopColorPluginConfig.value}`));
        }
        else {
            result.push(new StyleRule("borderTop", "none"));
        }

        if (pluginConfig.left && pluginConfig.left.width && pluginConfig.left.style && pluginConfig.left.colorKey) {
            const borderLeftColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.left.colorKey, this.themeContract);
            result.push(new StyleRule("borderLeft", `${StylePlugin.parseSize(pluginConfig.left.width)} ${pluginConfig.left.style} ${borderLeftColorPluginConfig.value}`));
        }
        else {
            result.push(new StyleRule("borderLeft", "none"));
        }

        if (pluginConfig.right && pluginConfig.right.width && pluginConfig.right.style && pluginConfig.right.colorKey) {
            const borderRightColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.right.colorKey, this.themeContract);
            result.push(new StyleRule("borderRight", `${StylePlugin.parseSize(pluginConfig.right.width)} ${pluginConfig.right.style} ${borderRightColorPluginConfig.value}`));
        }
        else {
            result.push(new StyleRule("borderRight", "none"));
        }

        if (pluginConfig.bottom && pluginConfig.bottom.width && pluginConfig.bottom.style && pluginConfig.bottom.colorKey) {
            const borderBottomColorpluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.bottom.colorKey, this.themeContract);
            result.push(new StyleRule("borderBottom", `${StylePlugin.parseSize(pluginConfig.bottom.width)} ${pluginConfig.bottom.style} ${borderBottomColorpluginConfig.value}`));
        }
        else {
            result.push(new StyleRule("borderBottom", "none"));
        }

        return result;
    }
}