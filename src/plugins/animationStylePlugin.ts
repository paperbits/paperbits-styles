import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, AnimationContract } from "../contracts";

export class AnimationStylePlugin extends StylePlugin {
    public displayName = "Animation";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToJss(animation): Promise<Object> {
        const contract = Utils.getObjectAt<AnimationContract>(animation.animationKey, this.themeContract);

        const result = {
            animationName: contract.name,
            animationDuration: animation.duration ? animation.duration + "s" : "0",
            animationIterationCount: animation.iterationCount || "infinite",
            animationTimingFunction: animation.timingFunction || "linear"
        };

        return result;
    }
}