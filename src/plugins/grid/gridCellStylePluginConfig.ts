import { ContentOverflow } from "../../contracts/contentOverflow";
import { ContentAlignment } from "../../contracts/contentAlignment";

export interface GridCellSpan {
    /**
     * Column span is useful when only on horizontal position (left or right) specified.
     */
    cols?: number;

    /**
     * Row span is useful when only on vertical position (top or bottom) specified.
     */
    rows?: number;
}

export interface GridCellPosition {
    col?: number;
    row?: number;
}

export interface GridCellStylePluginConfig {
    position: GridCellPosition;
    span?: GridCellSpan;
    alignment?: ContentAlignment;
    overflow: ContentOverflow;
}