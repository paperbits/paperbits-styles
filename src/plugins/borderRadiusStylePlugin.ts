import { StylePlugin } from "./stylePlugin";
import { BorderRadiusContract } from "../contracts";

export class BorderRadiusStylePlugin extends StylePlugin {
    public displayName = "Border radius";

    public compile(contract: BorderRadiusContract): Object {
        const result = {
            borderTopLeftRadius: contract.topLeftRadius || 0,
            borderTopRightRadius: contract.topRightRadius || 0,
            borderBottomLeftRadius: contract.bottomLeftRadius || 0,
            borderBottomRightRadius: contract.bottomRightRadius || 0
        };

        return result;
    }
}