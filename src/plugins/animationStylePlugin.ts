import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, AnimationContract } from "../contracts";

export class AnimationStylePlugin extends StylePlugin {
    public displayName = "Animation";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }
    public compile(animationKey: string): Object {
        const contract = Utils.getObjectAt<AnimationContract>(animationKey, this.themeContract);

        const result = {
            animationName: contract.name,
            animationDuration: contract.duration || 0,
            animationIterationCount: contract.iterationCount || "infinite",
            animationTimingFunction: contract.timingFunction || "linear"
        };

        return result;
    }
}