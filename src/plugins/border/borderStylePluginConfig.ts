import { StylePluginConfig } from "@paperbits/common/styles";
import { BorderStyle } from "./borderStyle";

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

