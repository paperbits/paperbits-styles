import { Contract } from "@paperbits/common";


export interface SizeContract extends Contract {
    maxWidth?: string;
    maxHeight?: string;
    minWidth?: string;
    minHeight?: string;
}