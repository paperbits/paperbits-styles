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
