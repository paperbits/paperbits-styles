import * as Objects from "@paperbits/common";
import { StylePlugin } from "../stylePlugin";
import { ThemeContract, FontContract, ColorContract, ShadowContract } from "../../contracts";
import { TypographyStylePluginConfig } from "./typographyStylePluginConfig";
import { StyleRule } from "@paperbits/common/styles";
import { StyleHelper } from "../../styleHelper";

export class TypographyStylePlugin extends StylePlugin {
    private themeContract: ThemeContract;
    public readonly name: string = "typography";

    constructor() {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public async configToStyleRules(pluginConfig: TypographyStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (!StyleHelper.isValueEmpty(pluginConfig.fontWeight)) {
            result.push(new StyleRule("fontWeight", pluginConfig.fontWeight));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.fontStyle)) {
            result.push(new StyleRule("fontStyle", pluginConfig.fontStyle));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.fontSize)) {
            result.push(new StyleRule("fontSize", StyleHelper.parseValue(pluginConfig.fontSize)));
        }

        if (pluginConfig.fontKey) {
            const fontContract = Objects.getObjectAt<FontContract>(pluginConfig.fontKey, this.themeContract);

            if (fontContract) {
                result.push(new StyleRule("fontFamily", fontContract.family));
            }
            else {
                console.warn(`Font with key "${pluginConfig.fontKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.lineHeight)) {
            result.push(new StyleRule("lineHeight", StyleHelper.parseValue(pluginConfig.lineHeight)));
        }

        if (!StyleHelper.isValueEmpty(pluginConfig.letterSpacing)) {
            result.push(new StyleRule("letterSpacing", StyleHelper.parseValue(pluginConfig.letterSpacing)));
        }

        if (pluginConfig.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(pluginConfig.colorKey, this.themeContract);

            if (colorContract) {
                result.push(new StyleRule("color", `${colorContract.value}` || "transparent"));
            }
            else {
                console.warn(`Color with key "${pluginConfig.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (pluginConfig.shadowKey) {
            const shadowContract = Objects.getObjectAt<ShadowContract>(pluginConfig.shadowKey, this.themeContract);

            if (shadowContract) {
                if (!shadowContract.color) {
                    result.push(new StyleRule("textShadow", "none"));
                }
                else {
                    const x = StyleHelper.parseValue(shadowContract.offsetX || 0);
                    const y = StyleHelper.parseValue(shadowContract.offsetY || 0);
                    const blur = StyleHelper.parseValue(shadowContract.blur || 0);
                    const color = shadowContract.color || "#000";

                    result.push(new StyleRule("textShadow", [x, y, blur, color].join(" ")));
                }

                // Text inset shadow example:
                // background-color: #565656;
                // color: transparent;
                // text-shadow: 0px 2px 3px rgba(255,255,255,0.5);
                // -webkit-background-clip: text;
                //    -moz-background-clip: text;
                //         background-clip: text;
            }
            else {
                console.warn(`Shadow with key "${pluginConfig.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (pluginConfig.textAlign) {
            result.push(new StyleRule("textAlign", pluginConfig.textAlign));
        }

        if (pluginConfig.textTransform) {
            result.push(new StyleRule("textTransform", pluginConfig.textTransform));
        }

        if (pluginConfig.textDecoration) {
            result.push(new StyleRule("textDecoration", pluginConfig.textDecoration));
        }

        return result;
    }
}
