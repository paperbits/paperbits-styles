import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, TypographyContract, FontContract, ColorContract, ShadowContract } from "../contracts";

export class TypographyStylePlugin extends StylePlugin {
    public displayName = "Typeography";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }
    public compile(typographyContract: TypographyContract): Object {
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
            const fontContract = Utils.getObjectAt<FontContract>(typographyContract.fontKey, this.themeContract);
            result["fontFamily"] = fontContract.family;
        }

        if (typographyContract.colorKey) {
            const colorContract = Utils.getObjectAt<ColorContract>(typographyContract.colorKey, this.themeContract);
            result["color"] = colorContract.value || "transparent";
        }

        if (typographyContract.shadowKey) {
            const shadowContract = Utils.getObjectAt<ShadowContract>(typographyContract.shadowKey, this.themeContract);

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

        if (typographyContract.textAlign) {
            result["textAlign"] = typographyContract.textAlign;
        }

        return result;
    }
}
