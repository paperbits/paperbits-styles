import { StylePluginConfig } from "@paperbits/common/styles";

/**
 * Size style plugin configuration.
 */
export interface SizeStylePluginConfig extends StylePluginConfig {
    /**
     * Maixmum horizontal space that UI element can take.
     */
    maxWidth?: string | number;

    /**
     * Maixmum vertical space that UI element can take.
     */
    maxHeight?: string | number;

    /**
     * Minimun horizontal space that UI element can take.
     */
    minWidth?: string | number;

    /**
     * Minimum vertical space that UI element can take.
     */
    minHeight?: string | number;

    /**
     * vertical space that UI element take.
     */
    height?: string | number;

    /**
     * horizontal space that UI element take.
     */
    width?: string | number;

    /**
     * Inidicates if UI element should take all the available space.
     */
    stretch?: boolean;
}