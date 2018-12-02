export interface AnimationContract {
    /**
     * Own key.
     */
    key?: string;

    displayName?: string;

    /**
     * Name of animation keyframe (it should be pre-defined in CSS).
     */
    name?: string;

    /**
     * Duration (in milliseconds). e.g. "infinite".
     */
    duration?: string | number;

    /**
     * Count.
     */
    iterationCount?: string | number;

    /**
     * Timiing function, e.g. "linear".
     */
    timingFunction?: string;
}