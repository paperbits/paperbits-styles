import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { TableCellStylePluginConfig } from "./tableCellStylePluginConfig";


export class TableCellStylePlugin extends StylePlugin {
    public displayName: string = "Table area";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: TableCellStylePluginConfig): Promise<StyleRule[]> {
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

        rules.push(new StyleRule("overflowY", "auto"));
        rules.push(new StyleRule("overflowX", "auto"));

        return rules;
    }
}