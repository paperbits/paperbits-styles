import { Contract, Breakpoints } from "@paperbits/common";
import { ContentAlignment } from "./contentAlignment";
import { ContentOverflow } from "./contentOverflow";


export interface ContainerContract extends Contract {
    alignment?: ContentAlignment;
    overflow?: ContentOverflow;
}