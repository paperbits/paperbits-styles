import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, TypographyContract, FontContract, ColorContract, ShadowContract } from "../contracts";

export class TypographyStylePlugin extends StylePlugin {
    public readonly name = "typography";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToJss(typographyContract: TypographyContract): Promise<Object> {
        const result = {};

        if (typographyContract.fontWeight) {
            result["fontWeight"] = typographyContract.fontWeight;
        }

        if (typographyContract.fontStyle) {
            result["fontStyle"] = typographyContract.fontStyle;
        }

        if (typographyContract.fontSize) {
            result["fontSize"] = typographyContract.fontSize;
        }

        if (typographyContract.fontKey) {
            const fontContract = Objects.getObjectAt<FontContract>(typographyContract.fontKey, this.themeContract);

            if (fontContract) {
                result["fontFamily"] = fontContract.family;
            }
            else {
                console.warn(`Font with key "${typographyContract.fontKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.lineHeight) {
            result["lineHeight"] = typographyContract.lineHeight;
        }

        if (typographyContract.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(typographyContract.colorKey, this.themeContract);

            if (colorContract) {
                result["color"] = colorContract.value || "transparent";
            }
            else {
                console.warn(`Color with key "${typographyContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.shadowKey) {
            const shadowContract = Objects.getObjectAt<ShadowContract>(typographyContract.shadowKey, this.themeContract);

            if (shadowContract) {
                result["textShadow"] = {
                    x: shadowContract.offsetX || 0,
                    y: shadowContract.offsetY || 0,
                    blur: shadowContract.blur || 0,
                    color: shadowContract.color || "#000"
                };

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
            result["textAlign"] = typographyContract.textAlign;
        }

        if (typographyContract.textTransform) {
            result["textTransform"] = typographyContract.textTransform;
        }

        return result;
    }
}
