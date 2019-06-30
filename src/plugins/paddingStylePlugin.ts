import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { PaddingContract } from "../contracts";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async configToStyleRules(contract: PaddingContract): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("paddingTop", StylePlugin.parseSize(contract.top)),
            new StyleRule("paddingLeft", StylePlugin.parseSize(contract.left)),
            new StyleRule("paddingRight", StylePlugin.parseSize(contract.right)),
            new StyleRule("paddingBottom", StylePlugin.parseSize(contract.bottom))
        ];

        return rules;
    }
}
