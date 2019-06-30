import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { GridCellStylePluginConfig } from "./gridCellStylePluginConfig";


export class GridCellStylePlugin extends StylePlugin {
    public displayName: string = "Grid area";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: GridCellStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("display", "flex"),
            new StyleRule("flexWrap", "wrap"),
            new StyleRule("justifyContent", "center"),
            new StyleRule("alignContent", "center")
        ];

        if (pluginConfig.position) {
            result.push(new StyleRule("gridColumnStart", pluginConfig.position.col));
            result.push(new StyleRule("gridColumnEnd", pluginConfig.position.col + pluginConfig.span.cols));
            result.push(new StyleRule("gridRowStart", pluginConfig.position.row));
            result.push(new StyleRule("gridRowEnd", pluginConfig.position.row + pluginConfig.span.rows));
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

                result.push(new StyleRule("justifyContent", value));
            }

            if (pluginConfig.alignment.vertical) {
                let value = pluginConfig.alignment.vertical;

                if (pluginConfig.alignment.vertical === "start" || pluginConfig.alignment.vertical === "end") {
                    value = "flex-" + value;
                }

                if (pluginConfig.alignment.vertical === "around" || pluginConfig.alignment.vertical === "between") {
                    value = "space-" + value;
                }

                result.push(new StyleRule("alignContent", value));
            }
        }

        if (pluginConfig.overflow) {
            if (pluginConfig.overflow.vertical && pluginConfig.overflow.horizontal) {
                result.push(new StyleRule("overflow", "auto"));
            }
            else if (pluginConfig.overflow.vertical) {
                result.push(new StyleRule("overflowY", "auto"));
            }
            else {
                result.push(new StyleRule("overflowX", "auto"));
            }
        }

        return result;
    }
}