import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { BorderRadiusContract } from "../contracts";


export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name: string = "borderRadius";

    public async configToStyleRules(contract: BorderRadiusContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("borderTopLeftRadius", StylePlugin.parseSize(contract.topLeftRadius)),
            new StyleRule("borderTopRightRadius", StylePlugin.parseSize(contract.topRightRadius)),
            new StyleRule("borderBottomLeftRadius", StylePlugin.parseSize(contract.bottomLeftRadius)),
            new StyleRule("borderBottomRightRadius", StylePlugin.parseSize(contract.bottomRightRadius))
        ];

        return result;
    }
}