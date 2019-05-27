import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { StyleCompiler } from "..";

export class ComponentsStylePlugin extends StylePlugin {
    public readonly name: string = "components";

    constructor(private readonly styleCompiler: StyleCompiler) {
        super();
    }

    public async contractToJss(componentsConfig: any): Promise<Object> {
        const result = {};

        for (let componentName of Object.keys(componentsConfig)) {
            const componentConfig = componentsConfig[componentName];

            let defaultComponentStyles = await this.styleCompiler.getVariationClasses(componentConfig["default"], componentName, "default", true);
            const variations = Object.keys(componentConfig);

            if (!defaultComponentStyles && variations.length <= 1) {
                continue;
            } else {
                defaultComponentStyles = defaultComponentStyles || {};
            }

            for (const variationName of variations) {
                if (variationName === "default") {
                    continue;
                }

                const variationStyles = await this.styleCompiler.getVariationClasses(componentConfig[variationName], componentName, variationName, true);

                if (!variationStyles) {
                    continue;
                }

                componentName = Utils.camelCaseToKebabCase(componentName);

                const key = `& .${componentName}-${variationName}`;
                defaultComponentStyles[componentName] = { ...defaultComponentStyles[componentName], [`&.${componentName}-${variationName}`]: variationStyles[key] };
            }

            Utils.assign(result, defaultComponentStyles);
        }

        return result;
    }
}