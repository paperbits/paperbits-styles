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
     * Count of animation iterations.
     */
    iterationCount?: string | number;
    
    /**
     * Animation timing function, e.g. "linear".
     */
    timingFunction?: string;
}
