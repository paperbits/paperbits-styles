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

        for (const componentName of Object.keys(componentsConfig)) {
            const componentConfig = componentsConfig[componentName];

            const defaultComponentStyles = await this.styleCompiler.getVariationClasses(componentConfig["default"], componentName, "default", true);

            if (!defaultComponentStyles) {
                continue;
            }

            for (const variationName of Object.keys(componentConfig)) {
                if (variationName === "default") continue;
                const variationStyles = await this.styleCompiler.getVariationClasses(componentConfig[variationName], componentName, variationName, true);
                const key = `& .${componentName}-${variationName}`;
                defaultComponentStyles[componentName] = { ...defaultComponentStyles[componentName], [`&.${componentName}-${variationName}`]: variationStyles[key] };
            }

            Utils.assign(result, defaultComponentStyles);
        }

        return result;
    }
}