import { PrimitiveContract } from "@paperbits/common/styles";


export interface ShadowContract extends PrimitiveContract {
    /**
     * Shadow offset X.
     */
    offsetX: string | number;

    /**
     * Shadow offset Y.
     */
    offsetY: string | number;

    /**
     * Shadow spread radius.
     */
    spread: string | number;

    /**
     * Shadow blur radius.
     */
    blur: string | number;

    /**
     * Shadow color.
     */
    color: string | number;

    /**
     * Display the shadow inset.
     */
    inset?: boolean;
}
