import { PrimitiveContract } from "@paperbits/common/styles";

export interface ColorContract extends PrimitiveContract {
    /**
     * Color value, e.g. "#ffffff", "white".
     */
    value?: string;
}
