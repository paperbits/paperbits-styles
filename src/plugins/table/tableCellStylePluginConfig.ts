import { ContentOverflow } from "../../contracts/contentOverflow";
import { ContentAlignment } from "../../contracts/contentAlignment";
import { StylePluginConfig } from "@paperbits/common/styles";

export interface TableCellSpan {
    /**
     * Column span is useful when only on horizontal position (left or right) specified.
     */
    cols?: number;

    /**
     * Row span is useful when only on vertical position (top or bottom) specified.
     */
    rows?: number;
}

export interface TableCellPosition {
    col?: number;
    row?: number;
}

export interface TableCellStylePluginConfig extends StylePluginConfig {
    position: TableCellPosition;
    span?: TableCellSpan;
    alignment?: ContentAlignment;
    overflow: ContentOverflow;
}