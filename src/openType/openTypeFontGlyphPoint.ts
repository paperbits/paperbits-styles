export interface OpenTypeFontGlyphPoint {
    /**
     * Indicates if this point is the last on the contour.
     */
    lastPointOfContour: boolean;

    onCurve: boolean;

    /**
     * Position X.
     */
    x: number;

    /**
     * Position Y.
     */
    y: number;
}