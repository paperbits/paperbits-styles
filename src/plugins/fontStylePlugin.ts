import { ThemeContract } from "../contracts";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { FontFace } from "@paperbits/common/styles";

export class FontsStylePlugin {
    public displayName: string = "Font";

    constructor(
        private readonly permalinkResolver: IPermalinkResolver,
        private readonly themeContract: ThemeContract
    ) {
    }

    public async contractToFontFaces(): Promise<FontFace[]> {
        const fontFaces = [];

        if (!this.themeContract.fonts) {
            return fontFaces;
        }

        for (const fontKey of Object.keys(this.themeContract.fonts)) {
            const fontContract = this.themeContract.fonts[fontKey];

            if (!fontContract.variants) {
                continue;
            }

            for (const variant of fontContract.variants) {
                let fontVariantUrl;

                if (variant.sourceKey) {
                    fontVariantUrl = await this.permalinkResolver.getUrlByTargetKey(variant.sourceKey);
                }
                else if (variant.file || variant.permalink) {
                    fontVariantUrl = variant.file || variant.permalink;
                }
                else {
                    throw new Error("Font variant URL is empty.");
                }

                const fontFace = new FontFace();
                fontFace.fontFamily = fontContract.family;
                fontFace.source = fontVariantUrl;
                fontFace.fontStyle = variant.style || "normal";
                fontFace.fontWeight = variant.weight || "normal";

                fontFaces.push(fontFace);
            }
        }

        return fontFaces;
    }
}
