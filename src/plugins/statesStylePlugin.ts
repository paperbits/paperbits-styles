import * as Utils from "@paperbits/common/utils";
import { Style, StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { StyleCompiler } from "..";


export class StatesStylePlugin extends StylePlugin {
    public name: string = "states";

    constructor(private readonly styleCompiler: StyleCompiler) {
        super();
    }

    public async configToPseudoStyles(statesConfig: any): Promise<Style[]> {
        const stateStyles: Style[] = [];

        for (const stateName of Object.keys(statesConfig)) {
            const stateConfig = statesConfig[stateName];
            const stateStyle = await this.styleCompiler.getStateStyle(stateConfig, stateName);

            stateStyles.push(stateStyle);
        }

        return stateStyles;
    }
}