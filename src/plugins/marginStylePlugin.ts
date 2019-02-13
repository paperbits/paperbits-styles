import { StylePlugin } from "./stylePlugin";
import { MarginContract } from "../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name = "margin";

    public async contractToJss(contract: MarginContract): Promise<Object> {
        return {
            marginTop: contract.top || 0,
            marginLeft: contract.left || 0,
            marginRight: contract.right || 0,
            marginBottom: contract.bottom || 0
        };
    }
}