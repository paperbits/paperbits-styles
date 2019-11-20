import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, TypographyStylePluginConfig, FontContract, ColorContract, ShadowContract } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class TypographyStylePlugin extends StylePlugin {
    public readonly name: string = "typography";

    constructor(private themeContract: ThemeContract) {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public async configToStyleRules(pluginConfig: TypographyStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (pluginConfig.fontWeight) {
            result.push(new StyleRule("fontWeight", pluginConfig.fontWeight));
        }

        if (pluginConfig.fontStyle) {
            result.push(new StyleRule("fontStyle", pluginConfig.fontStyle));
        }

        if (pluginConfig.fontSize) {
            result.push(new StyleRule("fontSize", StylePlugin.parseSize(pluginConfig.fontSize)));
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

        if (pluginConfig.lineHeight) {
            result.push(new StyleRule("lineHeight", StylePlugin.parseSize(pluginConfig.lineHeight)));
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
                    const x = StylePlugin.parseSize(shadowContract.offsetX);
                    const y = StylePlugin.parseSize(shadowContract.offsetY);
                    const blur = StylePlugin.parseSize(shadowContract.blur);
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
