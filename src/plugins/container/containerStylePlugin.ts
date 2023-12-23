import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { ContainerStylePluginConfig } from "./containerStylePluginConfig";


export class ContainerStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: ContainerStylePluginConfig): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("display", "flex"),
            new StyleRule("flexWrap", "wrap"),
            new StyleRule("justifyContent", "center"),
            new StyleRule("alignContent", "center")
        ];

        if (pluginConfig.alignment) {
            if (pluginConfig.alignment.horizontal) {
                let value = pluginConfig.alignment.horizontal;

                if (pluginConfig.alignment.horizontal === "start" || pluginConfig.alignment.horizontal === "end") {
                    value = "flex-" + value;
                }

                if (pluginConfig.alignment.horizontal === "around" || pluginConfig.alignment.horizontal === "between") {
                    value = "space-" + value;
                }

                rules.push(new StyleRule("justifyContent", value));
            }

            if (pluginConfig.alignment.vertical) {
                let value = pluginConfig.alignment.vertical;

                if (pluginConfig.alignment.vertical === "start" || pluginConfig.alignment.vertical === "end") {
                    value = "flex-" + value;
                }

                if (pluginConfig.alignment.vertical === "around" || pluginConfig.alignment.vertical === "between") {
                    value = "space-" + value;
                }

                rules.push(new StyleRule("alignContent", value));
            }
        }

        if (pluginConfig.overflow) {
            if (pluginConfig.overflow.vertical == "auto" && pluginConfig.overflow.horizontal == "auto") {
                rules.push(new StyleRule("overflow", "auto"));
            }
            else {
                if (pluginConfig.overflow.vertical) {
                    rules.push(new StyleRule("overflowY", "auto"));
                }
                if (pluginConfig.overflow.horizontal) {
                    rules.push(new StyleRule("overflowX", "auto"));
                }
            }
        }

        return rules;
    }
}