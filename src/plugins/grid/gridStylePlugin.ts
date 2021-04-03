import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { GridStylePluginConfig } from "../grid/gridStylePluginConfig";


export class GridStylePlugin extends StylePlugin {
    public displayName: string = "Grid";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: GridStylePluginConfig): Promise<StyleRule[]> {
        const result = [];
        result.push(new StyleRule("display", "grid"));
        result.push(new StyleRule("gridTemplateColumns", pluginConfig.cols.join(" ")));
        result.push(new StyleRule("gridTemplateRows", pluginConfig.rows.join(" ")));
        result.push(new StyleRule("gridColumnGap", pluginConfig.colGap));
        result.push(new StyleRule("gridRowGap", pluginConfig.rowGap));
        result.push(new StyleRule("width", "100%"));
        result.push(new StyleRule("flex", 1));
        return result;
    }
}