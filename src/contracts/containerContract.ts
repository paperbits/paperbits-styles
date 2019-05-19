import { Contract, Breakpoints } from "@paperbits/common";
import { ContentAlignment } from "./ContentAlignment";
import { ContentOverflow } from "./ContentOverflow";


export interface ContainerContract extends Contract {
    alignment?: ContentAlignment;
    overflow?: ContentOverflow;
}