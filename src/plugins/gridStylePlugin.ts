import { StylePlugin } from "./stylePlugin";
import { GridContract } from "../contracts/gridContract";
import { StyleRule } from "@paperbits/common/styles";


export class GridStylePlugin extends StylePlugin {
    public displayName: string = "Grid";

    constructor() {
        super();
    }

    public async configToStyleRules(contract: GridContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("display", "grid"),
            new StyleRule("gridTemplateColumns", contract.cols.join(" ")),
            new StyleRule("gridTemplateRows", contract.rows.join(" ")),
            new StyleRule("gridColumnGap", contract.colGap),
            new StyleRule("gridRowGap", contract.rowGap),
            new StyleRule("width", "100%"),
            new StyleRule("flex", 1)
        ];

        return result;
    }
}