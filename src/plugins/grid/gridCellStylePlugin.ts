import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { GridCellStylePluginConfig } from "./gridCellStylePluginConfig";


export class GridCellStylePlugin extends StylePlugin {
    public displayName: string = "Grid area";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: GridCellStylePluginConfig): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("display", "flex"),
            new StyleRule("flexWrap", "wrap"),
            new StyleRule("justifyContent", "center"),
            new StyleRule("alignContent", "center"),
            new StyleRule("alignItems", "center"),
            new StyleRule("minWidth", "0")
        ];

        if (pluginConfig.position) {
            rules.push(new StyleRule("gridColumnStart", pluginConfig.position.col));
            rules.push(new StyleRule("gridColumnEnd", pluginConfig.position.col + pluginConfig.span.cols));
            rules.push(new StyleRule("gridRowStart", pluginConfig.position.row));
            rules.push(new StyleRule("gridRowEnd", pluginConfig.position.row + pluginConfig.span.rows));
        }

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
                rules.push(new StyleRule("alignItems", value));
            }
        }

        if (pluginConfig.overflow) {
            if (pluginConfig.overflow) {
                if (pluginConfig.overflow.vertical && pluginConfig.overflow.horizontal) {
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

            rules.push(new StyleRule("position", "absolute"));
            rules.push(new StyleRule("top", "0"));
            rules.push(new StyleRule("left", "0"));
            rules.push(new StyleRule("right", "0"));
            rules.push(new StyleRule("bottom", "0"));
        }

        return rules;
    }
}