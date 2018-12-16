import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { StyleCompiler } from "..";

export class ComponentsStylePlugin extends StylePlugin {
    public displayName = "Components";

    constructor(private readonly styleCompiler: StyleCompiler) {
        super();
    }

    public async contractToJss(componentsConfig): Promise<Object> {
        const result = {};

        for (const componentName of Object.keys(componentsConfig)) {
            const componentVariationConfig = componentsConfig[componentName];
            const pluginRules = await this.styleCompiler.getVariationClasses(componentVariationConfig, componentName, null, true);
            Object.assign(result, pluginRules);
        }

        return result;
    }
}