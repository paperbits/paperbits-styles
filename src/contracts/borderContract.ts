import { StylePluginConfig } from "@paperbits/common/styles";

/**
 * Border style configuration.
 */
export interface BorderStyle {
    /**
     * Border width, e.g. "2px".
     */
    width?: string | number;

    /**
     * Border style, e.g. "solid".
     */
    style?: string;

    /**
     * Key of the border color.
     */
    colorKey?: string;
}

/**
 * Border style plugin configuration.
 */
export interface BorderStylePluginConfig extends StylePluginConfig {
    /**
     * Top border configuration.
     */
    top?: BorderStyle;

    /**
     * Left border configuration.
     */
    left?: BorderStyle;

    /**
     * Right border configuration.
     */
    right?: BorderStyle;

    /**
     * Bottom border configuration.
     */
    bottom?: BorderStyle;
}

/**
 * Border radius style plugin configuration.
 */
export interface BorderRadiusStylePluginConfig extends StylePluginConfig {
    /**
     * Top-left radius.
     */
    topLeftRadius?: string | number;

    /**
     * Top-right radius
     */
    topRightRadius?: string | number;

    /**
     * Bottom-left radius
     */
    bottomLeftRadius?: string | number;

    /**
     * Bottom-right radius
     */
    bottomRightRadius?: string | number;
}