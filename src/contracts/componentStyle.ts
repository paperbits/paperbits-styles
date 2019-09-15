import { StyleItemContract } from "./styleItemContract";

export interface ComponentStyle {
    name: string;
    displayName: string;
    itemTemplate: string;
    variations: StyleItemContract[];
}