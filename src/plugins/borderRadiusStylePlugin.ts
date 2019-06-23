import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { BorderRadiusContract } from "../contracts";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async contractToStyleRules(contract: BorderRadiusContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("borderTopLeftRadius", this.parseSize(contract.topLeftRadius)),
            new StyleRule("borderTopRightRadius", this.parseSize(contract.topRightRadius)),
            new StyleRule("borderBottomLeftRadius", this.parseSize(contract.bottomLeftRadius)),
            new StyleRule("borderBottomRightRadius", this.parseSize(contract.bottomRightRadius))
        ];

        return result;
    }
}