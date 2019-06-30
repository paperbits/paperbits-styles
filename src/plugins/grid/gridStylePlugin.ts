import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { GridStylePluginConfig } from "../grid/gridStylePluginConfig";


export class GridStylePlugin extends StylePlugin {
    public displayName: string = "Grid";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: GridStylePluginConfig): Promise<StyleRule[]> {
        const result = [
            new StyleRule("display", "grid"),
            new StyleRule("gridTemplateColumns", pluginConfig.cols.join(" ")),
            new StyleRule("gridTemplateRows", pluginConfig.rows.join(" ")),
            new StyleRule("gridColumnGap", pluginConfig.colGap),
            new StyleRule("gridRowGap", pluginConfig.rowGap),
            new StyleRule("width", "100%"),
            new StyleRule("flex", 1)
        ];

        return result;
    }
}