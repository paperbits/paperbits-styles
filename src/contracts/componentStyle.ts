import { StyleContract } from "@paperbits/common/styles";

export interface ComponentStyle {
    name: string;
    displayName: string;
    itemTemplate: string;
    variations: StyleContract[];
}