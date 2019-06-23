import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { MarginContract } from "../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async contractToStyleRules(contract: MarginContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("marginTop", this.parseSize(contract.top)),
            new StyleRule("marginLeft", this.parseSize(contract.left)),
            new StyleRule("marginRight", this.parseSize(contract.right)),
            new StyleRule("marginBottom", this.parseSize(contract.bottom))
        ];

        return result;
    }
}