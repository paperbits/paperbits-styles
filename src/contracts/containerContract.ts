import { Contract } from "@paperbits/common";
import { ContentAlignment } from "./contentAlignment";
import { ContentOverflow } from "./contentOverflow";


export interface ContainerStylePluginConfig extends Contract {
    alignment?: ContentAlignment;
    overflow?: ContentOverflow;
}