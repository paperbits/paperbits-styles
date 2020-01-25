import { PrimitiveContract } from "@paperbits/common/styles";

export interface AnimationContract extends PrimitiveContract {
    /**
     * Name of animation keyframe (it should be pre-defined in CSS).
     * Later on, we'll introduce key frame configuration contracts.
     */
    name?: string;
}

