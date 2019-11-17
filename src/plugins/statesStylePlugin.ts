import { Style, StyleCompiler } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";


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