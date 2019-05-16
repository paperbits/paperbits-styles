import { Contract, Breakpoints } from "@paperbits/common";

export interface GridCellAlignment {
    vertical: string;
    horizontal: string;
}

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

export interface GridCellOverflow {
    vertical: string;
    horizontal: string;
}

export interface GridCellContract extends Contract {
    /**
     * @examples ["article", "header", "aside", "content", "footer"]
     */
    role: string;
    position: GridCellPosition;
    span?: GridCellSpan;
    alignment?: GridCellAlignment;
    overflow?: GridCellOverflow;
}