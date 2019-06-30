import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, ShadowContract, ShadowStylePluginConfig } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class ShadowStylePlugin extends StylePlugin {
    public readonly name: string = "shadow";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public static contractToStyleRules(contract: ShadowContract): StyleRule[] {
        if (!contract.color) {
            return [new StyleRule("boxShadow", "none")];
        }

        const offsetX = StylePlugin.parseSize(contract.offsetX);
        const offsetY = StylePlugin.parseSize(contract.offsetY);
        const blur = StylePlugin.parseSize(contract.blur);
        const spread = StylePlugin.parseSize(contract.spread);
        const color = contract.color || "#000";
        const inset = contract.inset ? "inset" : undefined;

        return [new StyleRule("boxShadow", [offsetX, offsetY, blur, spread, color, inset].join(" "))];
    }

    public async configToStyleRules(pluginConfig: ShadowStylePluginConfig): Promise<StyleRule[]> {
        if (!pluginConfig || !pluginConfig.shadowKey) {
            return [];
        }

        const shadowContract = Objects.getObjectAt<ShadowContract>(pluginConfig.shadowKey, this.themeContract);

        if (shadowContract) {
            return ShadowStylePlugin.contractToStyleRules(shadowContract);
        }
        else {
            console.warn(`Shadow with key "${pluginConfig.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            return [];
        }
    }
}