import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, ShadowContract, ShadowStylePluginConfig } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class ShadowStylePlugin extends StylePlugin {
    private themeContract: ThemeContract;
    public readonly name: string = "shadow";

    constructor() {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public contractToStyleRules(contract: ShadowContract): StyleRule[] {
        if (!contract.color) {
            return [new StyleRule("boxShadow", "none")];
        }

        const offsetX = this.parseValue(contract.offsetX);
        const offsetY = this.parseValue(contract.offsetY);
        const blur = this.parseValue(contract.blur);
        const spread = this.parseValue(contract.spread);
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
            return this.contractToStyleRules(shadowContract);
        }
        else {
            console.warn(`Shadow with key "${pluginConfig.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            return [];
        }
    }
}