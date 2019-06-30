export interface AnimationStylePluginConfig {
    /**
     * Key of animation.
     */
    animationKey: string;
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
