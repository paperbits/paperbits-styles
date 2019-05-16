/**
 * Grid style contract
 */
export interface GridContract {
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