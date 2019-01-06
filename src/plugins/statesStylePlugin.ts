import { StylePlugin } from "./stylePlugin";
import { StyleCompiler } from "..";

export class StatesStylePlugin extends StylePlugin {
    public displayName = "States";

    constructor(private readonly styleCompiler: StyleCompiler) {
        super();
    }

    public async contractToJss(statesConfig): Promise<Object> {
        const result = {};

        for (const stateName of Object.keys(statesConfig)) {
            const stateConfig = statesConfig[stateName];
            const pluginRules = await this.styleCompiler.getStateClasses(stateConfig, stateName);

            Object.assign(result, pluginRules);
        }

        return result;
    }
}