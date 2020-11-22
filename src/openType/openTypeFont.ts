import { OpenTypeFontTables } from "./openTypeFontTables";

export interface OpenTypeFontFamilyName {
    en: string;
}

export interface OpenTypeFontNames {
    fontFamily: OpenTypeFontFamilyName;
    fontSubfamily: OpenTypeFontFamilyName;
}

/**
 * OpenType font definition.
 */
export interface OpenTypeFont {
    /**
     * Number of glyphs.
     */
    numGlyphs: number;

    names: OpenTypeFontNames;

    /**
     * Glyph definitions.
     */
    glyphs: any;

    /**
     * Number of units per font size.
     */
    unitsPerEm: number;

    /**
     * Open type font tables.
     */
    tables: OpenTypeFontTables;

    /**
     * Initiates font download in browser.
     */
    download: () => void;

    /**
     * Exports the font to array buffer.
     */
    toArrayBuffer: () => ArrayBuffer;
}