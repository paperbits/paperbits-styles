import * as Objects from "@paperbits/common";
import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { AnimationContract, AnimationStylePluginConfig } from "./";
import { ThemeContract } from "../../contracts";


export class AnimationStylePlugin extends StylePlugin {
    public name: string = "animation";
    private themeContract: ThemeContract;

    constructor() {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public async configToStyleRules(pluginConfig: AnimationStylePluginConfig): Promise<StyleRule[]> {
        const contract = Objects.getObjectAt<AnimationContract>(pluginConfig.animationKey, this.themeContract);

        const result = [
            new StyleRule("animationName", contract.name),
            new StyleRule("animationDuration", pluginConfig.duration ? pluginConfig.duration + "s" : "0"),
            new StyleRule("animationIterationCount", pluginConfig.iterationCount || "infinite"),
            new StyleRule("animationTimingFunction", pluginConfig.timingFunction || "linear")
        ];

        return result;
    }
}