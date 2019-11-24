import { StylePluginConfig } from "@paperbits/common/styles";

export interface SizeStylePluginConfig extends StylePluginConfig {
    /**
     * Maixmum horizontal space that UI element can take.
     */
    maxWidth?: string;

    /**
     * Maixmum vertical space that UI element can take.
     */
    maxHeight?: string;

    /**
     * Minimun horizontal space that UI element can take.
     */
    minWidth?: string;

    /**
     * Minimum vertical space that UI element can take.
     */
    minHeight?: string;

    /**
     * Inidicates if UI element should take all the available space.
     */
    stretch?: boolean;
}