import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { TransformStylePluginConfig } from ".";


export class TransformStylePlugin extends StylePlugin {
    public readonly name: string = "transform";

    public async configToStyleRules(pluginConfig: TransformStylePluginConfig): Promise<StyleRule[]> {
        const transformOperations = [];

        if (pluginConfig.translate) {
            if (!this.isValueEmpty(pluginConfig.translate.x) && !this.isValueEmpty(pluginConfig.translate.y)) {
                const translateX = this.parseValue(pluginConfig.translate.x);
                const translateY = this.parseValue(pluginConfig.translate.y);
                transformOperations.push(`translate(${translateX},${translateY})`);
            }
            else if (!this.isValueEmpty(pluginConfig.translate.x)) {
                const translateX = this.parseValue(pluginConfig.translate.x);
                transformOperations.push(`translateX(${translateX})`);
            }
            else if (!this.isValueEmpty(pluginConfig.translate.y)) {
                const translateY = this.parseValue(pluginConfig.translate.y);
                transformOperations.push(`translateY(${translateY})`);
            }
        }

        if (pluginConfig.scale) {
            const scaleX = pluginConfig.scale.x || 1;
            const scaleY = pluginConfig.scale.y || 1;
            transformOperations.push(`scale(${scaleX},${scaleY})`);
        }

        if (pluginConfig.rotate) {
            transformOperations.push(`rotate(${pluginConfig.rotate}deg)`);
        }

        return [new StyleRule("transform", transformOperations.join(" "))];
    }
}
