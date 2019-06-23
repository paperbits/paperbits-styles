import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { PaddingContract } from "../contracts";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async contractToStyleRules(contract: PaddingContract): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("paddingTop", this.parseSize(contract.top)),
            new StyleRule("paddingLeft", this.parseSize(contract.left)),
            new StyleRule("paddingRight", this.parseSize(contract.right)),
            new StyleRule("paddingBottom", this.parseSize(contract.bottom))
        ];

        return rules;
    }
}
