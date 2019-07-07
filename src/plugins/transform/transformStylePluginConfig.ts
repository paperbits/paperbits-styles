/**
 * Moves an element by two dimentions.
 */
export interface TranslateConfig {
    /**
     * Horizontal translation, e.g. 100px.
     */
    x: string | number;

    /**
     * Vertical translation, e.g. 100px.
     */
    y: string | number;
}

/**
 * Scales an element by two dimentions.
 */
export interface ScaleConfig {
    /**
     * Horizontal scaling, e.g. 2.5.
     */
    x: string | number;

    /**
     * Vertical scaling, e.g. 2.5.
     */
    y: string | number;
}

/**
 * Applies transformation to an element.
 */
export interface TransformStylePluginConfig {
    /**
     * Translate configuration.
     */
    translate?: TranslateConfig;

    /**
     * Scale configuration.
     */
    scale?: ScaleConfig;

    /**
     * e.g. 45 (degrees)
     */
    rotate?: string | number;
}