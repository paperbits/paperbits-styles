import { Style, StyleCompiler, ComponentBagContract } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";

export class ComponentsStylePlugin extends StylePlugin {
    public readonly name: string = "components";

    constructor(private readonly styleCompiler: StyleCompiler) {
        super();
    }

    public async configToNestedStyles(componentsConfig: ComponentBagContract): Promise<Style[]> {
        const resultStyles: Style[] = [];

        for (const componentName of Object.keys(componentsConfig)) {
            const componentConfig = componentsConfig[componentName];
            const defaultVariation = componentConfig["default"];

            const componentStyle = defaultVariation
                ? await this.styleCompiler.getVariationStyle(defaultVariation, componentName)
                : new Style(componentName); // empty default style

            const variationNames = Object.keys(componentConfig);

            for (const variationName of variationNames) {
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