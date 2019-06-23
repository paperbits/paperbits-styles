import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, AnimationContract } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class AnimationStylePlugin extends StylePlugin {
    public name = "animation";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToStyleRules(animation): Promise<StyleRule[]> {
        const contract = Objects.getObjectAt<AnimationContract>(animation.animationKey, this.themeContract);

        const result = [
            new StyleRule("animationName", contract.name),
            new StyleRule("animationDuration", animation.duration ? animation.duration + "s" : "0"),
            new StyleRule("animationIterationCount", animation.iterationCount || "infinite"),
            new StyleRule("animationTimingFunction", animation.timingFunction || "linear")
        ];

        return result;
    }
}