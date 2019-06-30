import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { MarginContract } from "../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name: string = "margin";

    public async configToStyleRules(contract: MarginContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("marginTop", StylePlugin.parseSize(contract.top)),
            new StyleRule("marginLeft", StylePlugin.parseSize(contract.left)),
            new StyleRule("marginRight", StylePlugin.parseSize(contract.right)),
            new StyleRule("marginBottom", StylePlugin.parseSize(contract.bottom))
        ];

        return result;
    }
}