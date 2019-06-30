import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, TypographyContract, FontContract, ColorContract, ShadowContract } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class TypographyStylePlugin extends StylePlugin {
    public readonly name: string = "typography";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async configToStyleRules(typographyContract: TypographyContract): Promise<StyleRule[]> {
        const result = [];

        if (typographyContract.fontWeight) {
            result.push(new StyleRule("fontWeight", typographyContract.fontWeight));
        }

        if (typographyContract.fontStyle) {
            result.push(new StyleRule("fontStyle", typographyContract.fontStyle));
        }

        if (typographyContract.fontSize) {
            result.push(new StyleRule("fontSize", StylePlugin.parseSize(typographyContract.fontSize)));
        }

        if (typographyContract.fontKey) {
            const fontContract = Objects.getObjectAt<FontContract>(typographyContract.fontKey, this.themeContract);

            if (fontContract) {
                result.push(new StyleRule("fontFamily", fontContract.family));
            }
            else {
                console.warn(`Font with key "${typographyContract.fontKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.lineHeight) {
            result.push(new StyleRule("lineHeight", StylePlugin.parseSize(typographyContract.lineHeight)));
        }

        if (typographyContract.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(typographyContract.colorKey, this.themeContract);

            if (colorContract) {
                result.push(new StyleRule("color", colorContract.value || "transparent"));
            }
            else {
                console.warn(`Color with key "${typographyContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.shadowKey) {
            const shadowContract = Objects.getObjectAt<ShadowContract>(typographyContract.shadowKey, this.themeContract);

            if (shadowContract) {
                const x = StylePlugin.parseSize(shadowContract.offsetX);
                const y = StylePlugin.parseSize(shadowContract.offsetY);
                const blur = StylePlugin.parseSize(shadowContract.blur);
                const color = shadowContract.color || "#000";

                result.push(new StyleRule("textShadow", [x, y, blur, color].join(" ")));

                // Text inset shadow example:
                // background-color: #565656;
                // color: transparent;
                // text-shadow: 0px 2px 3px rgba(255,255,255,0.5);
                // -webkit-background-clip: text;
                //    -moz-background-clip: text;
                //         background-clip: text;
            }
            else {
                console.warn(`Shadow with key "${typographyContract.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.textAlign) {
            result.push(new StyleRule("textAlign", typographyContract.textAlign));
        }

        if (typographyContract.textTransform) {
            result.push(new StyleRule("textTransform", typographyContract.textTransform));
        }

        if (typographyContract.textDecoration) {
            result.push(new StyleRule("textDecoration", typographyContract.textDecoration));
        }

        return result;
    }
}
