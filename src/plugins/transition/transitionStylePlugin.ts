import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { TransitionStylePluginConfig } from "./";


export class TransitionStylePlugin extends StylePlugin {
    public name: string = "transition";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: TransitionStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("transitionDelay", pluginConfig.delay ? pluginConfig.delay + "s" : "0"),
            new StyleRule("transitionDuration", pluginConfig.duration ? pluginConfig.duration + "s" : "0"),
            new StyleRule("transitionProperty", "all"),
            new StyleRule("transitionTimingFunction", pluginConfig.timingFunction || "linear")
        ];

        return result;
    }
}