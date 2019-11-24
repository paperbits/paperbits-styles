import { ContentOverflow } from "../../contracts/contentOverflow";
import { ContentAlignment } from "../../contracts/contentAlignment";
import { StylePluginConfig } from "@paperbits/common/styles";

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

export interface GridCellStylePluginConfig extends StylePluginConfig {
    position: GridCellPosition;
    span?: GridCellSpan;
    alignment?: ContentAlignment;
    overflow: ContentOverflow;
}