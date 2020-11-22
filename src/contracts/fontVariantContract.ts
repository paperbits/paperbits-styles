/**
 * Font variant definition.
 */
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
     * @deprecated
     */
    file?: string;

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
