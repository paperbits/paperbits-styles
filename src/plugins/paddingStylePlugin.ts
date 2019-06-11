import { StylePlugin } from "./stylePlugin";
import { PaddingContract } from "../contracts";


export class PaddingStylePlugin extends StylePlugin {
    public readonly name: string = "padding";

    public async contractToJss(contract: PaddingContract): Promise<Object> {
        return {
            paddingTop: contract.top || 0,
            paddingLeft: contract.left || 0,
            paddingRight: contract.right || 0,
            paddingBottom: contract.bottom || 0
        };
    }
}
