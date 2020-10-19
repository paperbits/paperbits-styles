import * as opentype from "opentype.js";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IconsFontBlobKey } from "../constants";
import { FontContract, FontGlyphContract, ThemeContract } from "../contracts";
import { OpenTypeFont } from "./openTypeFont";
import { OpenTypeFontGlyph } from "./openTypeFontGlyph";


export class FontManager {
    constructor(private readonly blobStorage: IBlobStorage) { }

    public async addGlyph(styles: ThemeContract, newGlyph: OpenTypeFontGlyph): Promise<void> {
        let font: OpenTypeFont;
        let iconFont: FontContract = Objects.getObjectAt<FontContract>("fonts/icons", styles);
        const glyphs = [];
        const advanceWidths = []; // capturing advanceWidths (overcoming bug in openfont.js library)

        if (iconFont) {
            const fontUrl = await this.blobStorage.getDownloadUrl(IconsFontBlobKey);

            if (fontUrl) {
                font = await opentype.load(fontUrl, null, { lowMemory: true });

                for (let index = 0; index < font.numGlyphs; index++) {
                    const glyphInFont = font.glyphs.get(index);
                    glyphs.push(glyphInFont);
                    advanceWidths.push(glyphInFont.advanceWidth);
                }
            }
        }
        else {
            const notdefGlyph = new opentype.Glyph({
                name: ".notdef",
                unicode: 0,
                advanceWidth: 650,
                path: new opentype.Path()
            });

            glyphs.push(notdefGlyph);
            advanceWidths.push(notdefGlyph.advanceWidth);
        }

        if (!newGlyph.name) {
            newGlyph.name = "Icon";
        }

        glyphs.push(newGlyph);
        advanceWidths.push(newGlyph.advanceWidth);

        font = new opentype.Font({
            familyName: "MyIcons",
            styleName: "Medium",
            unitsPerEm: 400,
            ascender: 800,
            descender: -200,
            glyphs: glyphs
        });

        // Restoring advanceWidth
        glyphs.forEach((x, index) => x.advanceWidth = advanceWidths[index]);

        const fontArrayBuffer = font.toArrayBuffer();

        await this.blobStorage.uploadBlob(IconsFontBlobKey, new Uint8Array(fontArrayBuffer), "font/ttf");
        const downloadUrl = await this.blobStorage.getDownloadUrl(IconsFontBlobKey);

        iconFont = {
            displayName: "Icons",
            family: "Icons",
            key: "fonts/icons",
            variants: [
                {
                    file: downloadUrl,
                    style: "normal",
                    weight: "400"
                }
            ]
        };

        const identifier = Utils.identifier();
        const icon: FontGlyphContract = {
            key: `icons/${identifier}`,
            name: newGlyph.name,
            displayName: newGlyph.name,
            unicode: newGlyph.unicode
        };

        Objects.setValue(`icons/${identifier}`, styles, icon);
        Objects.setValue("fonts/icons", styles, iconFont);
    }

    public async removeGlyph(styles: ThemeContract, unicode: number): Promise<void> {
        let font: OpenTypeFont;
        let iconFont: FontContract = Objects.getObjectAt<FontContract>("fonts/icons", styles);
        const glyphs = [];
        const advanceWidths = []; // capturing advanceWidths (overcoming bug in openfont.js library)

        if (iconFont) {
            const fontUrl = await this.blobStorage.getDownloadUrl(IconsFontBlobKey);

            if (fontUrl) {
                font = await opentype.load(fontUrl, null, { lowMemory: true });

                for (let index = 0; index < font.numGlyphs; index++) {
                    const glyphInFont = font.glyphs.get(index);

                    if (glyphInFont.unicode !== unicode) {
                        glyphs.push(glyphInFont);
                        advanceWidths.push(glyphInFont.advanceWidth);
                    }
                }
            }
        }
        else {
            const notdefGlyph = new opentype.Glyph({
                name: ".notdef",
                unicode: 0,
                advanceWidth: 650,
                path: new opentype.Path()
            });

            glyphs.push(notdefGlyph);
            advanceWidths.push(notdefGlyph.advanceWidth);
        }

        font = new opentype.Font({
            familyName: "MyIcons",
            styleName: "Medium",
            unitsPerEm: 400,
            ascender: 800,
            descender: -200,
            glyphs: glyphs
        });

        // Restoring advanceWidth
        glyphs.forEach((x, index) => x.advanceWidth = advanceWidths[index]);

        const fontArrayBuffer = font.toArrayBuffer();

        await this.blobStorage.uploadBlob(IconsFontBlobKey, new Uint8Array(fontArrayBuffer), "font/ttf");
        const downloadUrl = await this.blobStorage.getDownloadUrl(IconsFontBlobKey);

        iconFont = {
            displayName: "Icons",
            family: "Icons",
            key: "fonts/icons",
            variants: [
                {
                    file: downloadUrl,
                    style: "normal",
                    weight: "400"
                }
            ]
        };

        Objects.setValue("fonts/icons", styles, iconFont);
    }
}