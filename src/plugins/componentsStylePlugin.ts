import { StyleCompiler } from "..";
import { Style } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";

export class ComponentsStylePlugin extends StylePlugin {
    public readonly name: string = "components";

    constructor(private readonly styleCompiler: StyleCompiler) { 
        super();
    }

    public async configToNestedStyles(componentsConfig: any): Promise<Style[]> {
        const resultStyles: Style[] = [];

        for (const componentName of Object.keys(componentsConfig)) {
            const componentConfig = componentsConfig[componentName];

            const componentStyle = await this.styleCompiler.getVariationStyle(componentConfig["default"], componentName);
            const variations = Object.keys(componentConfig);

            for (const variationName of variations) {
                if (variationName === "default") {
                    continue;
                }

                const variationStyle = await this.styleCompiler.getVariationStyle(componentConfig[variationName], componentName, variationName);
                componentStyle.modifierStyles.push(variationStyle);
            }

            resultStyles.push(componentStyle);
        }

        return resultStyles;
    }
}