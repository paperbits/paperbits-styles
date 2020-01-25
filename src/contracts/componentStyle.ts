import { VariationContract } from "@paperbits/common/styles";

export interface ComponentStyle {
    name: string;
    displayName: string;
    itemTemplate: string;
    variations: VariationContract[];
}