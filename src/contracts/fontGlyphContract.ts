import { PrimitiveContract } from "@paperbits/common/styles";

/**
 * Font glyph metadata.
 */
export interface FontGlyphContract extends PrimitiveContract {
    /**
     * Glyph name in the font.
     */
    name: string;

    /**
     * Glyph unicode identifier in the font.
     */
    unicode: number;
}