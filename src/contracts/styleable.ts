import { PrimitiveContract } from "@paperbits/common/styles";

export interface Styleable {
    key?: string;
    style?: PrimitiveContract;
    toggleBackground?: () => void;
    setState?: (state: string) => void;
    state?: any;
    applyChanges?: () => void;
    variationCard?: any;
}