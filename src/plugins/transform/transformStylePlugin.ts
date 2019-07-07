import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "../stylePlugin";
import { TransformStylePluginConfig } from ".";


export class TransformStylePlugin extends StylePlugin {
    public readonly name: string = "transform";

    public async configToStyleRules(pluginConfig: TransformStylePluginConfig): Promise<StyleRule[]> {
        const transformOperations = [];

        if (pluginConfig.translate) {
            const translateX = pluginConfig.translate.x ? StylePlugin.parseSize(pluginConfig.translate.x) : 0;
            const translateY = pluginConfig.translate.y ? StylePlugin.parseSize(pluginConfig.translate.y) : 0;
            transformOperations.push(`translate(${translateX},${translateY})`);
        }

        if (pluginConfig.scale) {
            const scaleX = pluginConfig.scale.x ? pluginConfig.scale.x : 1;
            const scaleY = pluginConfig.scale.y ? pluginConfig.scale.y : 1;
            transformOperations.push(`scale(${scaleX},${scaleY})`);
        }

        if (pluginConfig.rotate) {
            transformOperations.push(`rotate(${pluginConfig.rotate}deg)`);
        }

        return [new StyleRule("transform", transformOperations.join(" "))];
    }
}
