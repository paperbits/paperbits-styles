export interface AnimationContract {
    /**
     * Own key.
     */
    key?: string;

    displayName?: string;

    /**
     * Name of animation keyframe (it should be pre-defined in CSS). Later on, we'll introduce key frame configuration contracts.
     */
    name?: string;
}

