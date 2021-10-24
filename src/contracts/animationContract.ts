import { PluginBag, PrimitiveContract } from "@paperbits/common/styles";

export interface AnimationContract extends PrimitiveContract {
    /**
     * Name of animation keyframe, e.g. `bounce`.
     */
    name?: string;

    /**
     * Animation frames.
     */
    frames?: AnimationFrame[];    
}

/**
 * Animation frame is intermediate step in the animation sequence.
 */
export interface AnimationFrame {
    /**
     * Step of animation in percents (0% - 100%).
     */
    step: number;

    /**
     * Property values being assigned at this step.
     */
    properties: PluginBag;
}