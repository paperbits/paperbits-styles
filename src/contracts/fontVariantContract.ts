/**
 * Font variant definition.
 */
export interface FontVariantContract {
    /**
     * Font weight, e.g. "400", "bold", etc.
     */
    weight: number | string;

    /**
     * Font style, e.g. "normal", "italic".
     */
    style: string;

    /**
     * @deprecated Font file location, e.g. `https://cdn.paperbits.io/fonts/JollyGoodSans-Basic.woff2`.
     */
    file?: string;

    /**
     * Font mime-type, e.g. `font/ttf`.
     */
    mimeType?: string;

    /**
     * Font variant permalink, e.g. "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjcmODbY.ttf".
     */
    permalink?: string;

    /**
     * A key that is used to identify a font source.
     */
    sourceKey?: string;

    /**
     * @deprecated.
     */
    sourceId?: string;
}
