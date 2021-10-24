import * as Objects from "@paperbits/common";
import { StylePlugin } from "../stylePlugin";
import {  ColorContract, ThemeContract } from "../../contracts";
import { BorderStylePluginConfig } from "./borderStylePluginConfig";
import { StyleRule } from "@paperbits/common/styles";
import { StyleHelper } from "../../styleHelper";

export class BorderStylePlugin extends StylePlugin {
    private themeContract: ThemeContract;
    public readonly name: string = "border";

    constructor() {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public async configToStyleRules(pluginConfig: BorderStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (pluginConfig.top && pluginConfig.top.width && pluginConfig.top.style && pluginConfig.top.colorKey) {
            const borderTopColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.top.colorKey, this.themeContract);

            if (borderTopColorPluginConfig) {
                result.push(new StyleRule("borderTop", `${StyleHelper.parseValue(pluginConfig.top.width)} ${pluginConfig.top.style} ${borderTopColorPluginConfig.value}`));
            }
        }
        else {
            result.push(new StyleRule("borderTop", "none"));
        }

        if (pluginConfig.left && pluginConfig.left.width && pluginConfig.left.style && pluginConfig.left.colorKey) {
            const borderLeftColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.left.colorKey, this.themeContract);

            if (borderLeftColorPluginConfig) {
                result.push(new StyleRule("borderLeft", `${StyleHelper.parseValue(pluginConfig.left.width)} ${pluginConfig.left.style} ${borderLeftColorPluginConfig.value}`));
            }
        }
        else {
            result.push(new StyleRule("borderLeft", "none"));
        }

        if (pluginConfig.right && pluginConfig.right.width && pluginConfig.right.style && pluginConfig.right.colorKey) {
            const borderRightColorPluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.right.colorKey, this.themeContract);

            if (borderRightColorPluginConfig) {
                result.push(new StyleRule("borderRight", `${StyleHelper.parseValue(pluginConfig.right.width)} ${pluginConfig.right.style} ${borderRightColorPluginConfig.value}`));
            }
        }
        else {
            result.push(new StyleRule("borderRight", "none"));
        }

        if (pluginConfig.bottom && pluginConfig.bottom.width && pluginConfig.bottom.style && pluginConfig.bottom.colorKey) {
            const borderBottomColorpluginConfig = Objects.getObjectAt<ColorContract>(pluginConfig.bottom.colorKey, this.themeContract);

            if (borderBottomColorpluginConfig) {
                result.push(new StyleRule("borderBottom", `${StyleHelper.parseValue(pluginConfig.bottom.width)} ${pluginConfig.bottom.style} ${borderBottomColorpluginConfig.value}`));
            }
        }
        else {
            result.push(new StyleRule("borderBottom", "none"));
        }

        return result;
    }
}