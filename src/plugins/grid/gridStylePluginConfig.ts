import { StylePluginConfig } from "@paperbits/common/styles";

/**
 * Grid style plugin configuration.
 */
export interface GridStylePluginConfig extends StylePluginConfig {
    /**
     * Row dimensions, e.g. ["1fr", "2fr", "1fr"].
     */
    rows: string[];

    /**
     * Gap between rows.
     */
    rowGap?: string;

    /**
     * Column dimensions, e.g. ["1fr", "2fr", "1fr"].
     */
    cols: string[];

    /**
     * Gap between columns.
     */
    colGap?: string;
}
