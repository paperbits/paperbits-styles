import { StylePlugin } from "./stylePlugin";
import { ThemeContract } from "../contracts";
import { IPermalinkResolver } from "@paperbits/common/permalinks";

export class FontsStylePlugin extends StylePlugin {
    public displayName = "Font";

    constructor(
        private readonly permalinkResolver: IPermalinkResolver,
        private readonly themeContract: ThemeContract
    ) {
        super();
    }

    public async contractToJss(): Promise<Object> {
        const fontFaceRules = [];

        for (const fontKey of Object.keys(this.themeContract.fonts)) {
            const fontContract = this.themeContract.fonts[fontKey];

            for (const variant of fontContract.variants) {
                let fontVariantUrl;

                if (variant.sourceKey) {
                    fontVariantUrl = await this.permalinkResolver.getUrlByTargetKey(variant.sourceKey);
                }
                else if (variant.file) {
                    fontVariantUrl = variant.file;
                }
                else {
                    throw new Error("Font variant URL is empty.");
                }

                fontFaceRules.push({
                    fontFamily: fontContract.family,
                    src: `url(${fontVariantUrl})`,
                    fontStyle: variant.style || "normal",
                    fontWeight: variant.weight || "normal"
                });
            }
        }

        const result = {
            "@font-face": fontFaceRules
        };

        return result;
    }
}