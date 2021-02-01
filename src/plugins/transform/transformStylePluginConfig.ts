import { StylePluginConfig } from "@paperbits/common/styles";

/**
 * Moves an element by dimentions.
 */
export interface TranslateConfig {
    /**
     * X-axis translation, e.g. 100px.
     */
    x?: string | number;

    /**
     * Y-axis translation, e.g. 100px.
     */
    y?: string | number;

    /**
     * Z-axis translation, e.g. 100px.
     */
    z?: string | number;
}

/**
 * Scales an element by dimentions.
 */
export interface ScaleConfig {
    /**
     * X-axis scaling, e.g. 2.5.
     */
    x?: string | number;

    /**
     * Y-axis scaling, e.g. 2.5.
     */
    y?: string | number;

    /**
     * Z-axis scaling, e.g. 2.5.
     */
    z?: string | number;
}

/**
 * Applies transformation to an element.
 */
export interface TransformStylePluginConfig extends StylePluginConfig {
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