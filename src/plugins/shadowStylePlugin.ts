import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, ShadowContract } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class ShadowStylePlugin extends StylePlugin {
    public readonly name: string = "shadow";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToStyleRules(shadow: any): Promise<StyleRule[]> {
        if (!shadow || !shadow.shadowKey) {
            return [];
        }

        const shadowContract = Objects.getObjectAt<ShadowContract>(shadow.shadowKey, this.themeContract);

        if (shadowContract) {
            if (shadowContract.color) {
                const x = this.parseSize(shadowContract.offsetX);
                const y = this.parseSize(shadowContract.offsetY);
                const blur = this.parseSize(shadowContract.blur);
                const spread = this.parseSize(shadowContract.spread);
                const color = shadowContract.color || "#000";
                const inset = shadowContract.inset ? "inset" : undefined;

                return [new StyleRule("boxShadow", [x, y, blur, spread, color, inset].join(" "))];

                // return {
                //     boxShadow: {
                //         x: shadowContract.offsetX || 0,
                //         y: shadowContract.offsetY || 0,
                //         blur: shadowContract.blur || 0,
                //         spread: shadowContract.spread || 0,
                //         color: shadowContract.color || "#000",
                //         inset: shadowContract.inset ? "inset" : undefined
                //     }
                // };
            }
            else {
                return [new StyleRule("boxShadow", "none")];
            }
        }
        else {
            console.warn(`Shadow with key "${shadow.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            return [];
        }
    }
}