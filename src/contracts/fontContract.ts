export interface FontVariantContract {
    /**
     * e.g. "400", "bold", etc.
     */
    weight: number | string;

    /**
     * e.g. "normal", "italic".
     */
    style: string;

    /**
     * e.g. "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjcmODbY.ttf".
     */
    file?: string;

    /**
     * A key that is used to identify a font source.
     */
    sourceKey?: string;
}

export interface FontContract {
    key: string;

    displayName: string;

    /**
     * e.g. "webfonts#webfont".
     */
    kind?: string;

    /**
     * e.g. "Advent Pro".
     */
    family: string;

    /**
     * e.g. "sans-serif"
     */
    category?: string;

    /**
     * e.g. [400, 500, "regular", "500", "500italic"].
     */
    variants: FontVariantContract[];

    /**
     * e.g. "v7"
     */
    version?: string;

    /**
     * e.g. "2017-10-10".
     */
    lastModified?: string;
}
