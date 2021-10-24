import { StyleRule } from "@paperbits/common/styles";
import { Display } from "./displayStylePluginConfig";
import { StylePlugin } from "../stylePlugin";


export class DisplayStylePlugin extends StylePlugin {
    public readonly name: string = "display";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: Display): Promise<StyleRule[]> {
        const rules = [];

        rules.push(new StyleRule("display", pluginConfig));

        return rules;
    }
}