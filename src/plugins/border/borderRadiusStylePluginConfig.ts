import { StylePluginConfig } from "@paperbits/common/styles";

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
