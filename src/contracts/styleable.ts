import { PrimitiveContract } from "@paperbits/common/styles";
import { ComponentVariationCard } from "../styleGuide";

export interface Styleable {
    key?: string;
    style?: PrimitiveContract;
    toggleBackground?: () => void;
    setState?: (state: string) => void;
    state?: any;
    applyChanges?: () => void;
    variationCard?: ComponentVariationCard;
}