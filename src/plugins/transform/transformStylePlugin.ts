import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { TransformStylePluginConfig } from ".";
import { StyleHelper } from "../../styleHelper";


export class TransformStylePlugin extends StylePlugin {
    public readonly name: string = "transform";

    public async configToStyleRules(pluginConfig: TransformStylePluginConfig): Promise<StyleRule[]> {
        const transformOperations = [];

        if (pluginConfig.translate) {
            if (!StyleHelper.isValueEmpty(pluginConfig.translate.x) && !StyleHelper.isValueEmpty(pluginConfig.translate.y)) {
                const translateX = StyleHelper.parseValue(pluginConfig.translate.x);
                const translateY = StyleHelper.parseValue(pluginConfig.translate.y);
                transformOperations.push(`translate(${translateX},${translateY})`);
            }
            else if (!StyleHelper.isValueEmpty(pluginConfig.translate.x)) {
                const translateX = StyleHelper.parseValue(pluginConfig.translate.x);
                transformOperations.push(`translateX(${translateX})`);
            }
            else if (!StyleHelper.isValueEmpty(pluginConfig.translate.y)) {
                const translateY = StyleHelper.parseValue(pluginConfig.translate.y);
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
