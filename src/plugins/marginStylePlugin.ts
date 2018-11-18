import { StylePlugin } from "./stylePlugin";
import { MarginContract } from "../contracts";


export class MarginStylePlugin extends StylePlugin {
    public displayName = "Margin";

    public compile(contract: MarginContract): Object {
        return {
            marginTop: contract.top || 0,
            marginLeft: contract.left || 0,
            marginRight: contract.right || 0,
            marginBottom: contract.bottom || 0
        };
    }
}