import { StylePluginConfig } from "@paperbits/common/styles";

export interface AnimationStylePluginConfig extends StylePluginConfig {
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
