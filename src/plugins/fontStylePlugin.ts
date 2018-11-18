import { StylePlugin } from "./stylePlugin";
import { ThemeContract } from "../contracts";

export class FontsStylePlugin extends StylePlugin {
    public displayName = "Font";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public compile(): Object {
        const fontFaceRules = [];

        Object.keys(this.themeContract.fonts).forEach(fontKey => {
            const fontContract = this.themeContract.fonts[fontKey];

            fontContract.variants.forEach(variant => {
                fontFaceRules.push({
                    fontFamily: fontContract.family,
                    src: `url(${variant.file})`,
                    fontStyle: variant.style || "normal",
                    fontWeight: variant.weight || "normal"
                });
            });
        });

        const result = {
            "@font-face": fontFaceRules
        };

        return result;
    }
}