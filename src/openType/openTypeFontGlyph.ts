import { OpenTypeFontGlyphPoint } from "./openTypeFontGlyphPoint";

export interface OpenTypeFontGlyph {
    /**
     * Icon name.
     */
    name: string;

    /**
     * Icon position in the font.
     */
    index: number;

    /**
     * Unicode number.
     */
    unicode: number;

    /**
     * Advance width is the white space taken by a glyph, regardless of the marking portions of the glyph.
     */
    advanceWidth: number;

    /**
     * Glyph drawing points.
     */
    points: OpenTypeFontGlyphPoint[];
}
