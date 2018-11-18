import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { StyleCompiler } from "..";

export class ComponentsStylePlugin extends StylePlugin {
    public displayName = "Components";

    constructor(
        private readonly styleCompiler: StyleCompiler
    ) {
        super();
    }

    public compile(componentsConfig): Object {
        const result = {};

        Object.keys(componentsConfig).forEach(componentName => {
            const componentVariationConfig = componentsConfig[componentName];

            const className = `& .${Utils.camelCaseToKebabCase(componentName)}`;
            result[className] = {};

            const pluginRules = this.styleCompiler.getVariationRules(componentVariationConfig);
            Object.assign(result[className], pluginRules);
        });

        return result;
    }
}