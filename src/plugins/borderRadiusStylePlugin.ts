import { StylePlugin } from "./stylePlugin";
import { BorderRadiusContract } from "../contracts";

export class BorderRadiusStylePlugin extends StylePlugin {
    public readonly name = "borderRadius";

    public async contractToJss(contract: BorderRadiusContract): Promise<Object> {
        const result = {
            borderTopLeftRadius: contract.topLeftRadius || 0,
            borderTopRightRadius: contract.topRightRadius || 0,
            borderBottomLeftRadius: contract.bottomLeftRadius || 0,
            borderBottomRightRadius: contract.bottomRightRadius || 0
        };

        return result;
    }
}