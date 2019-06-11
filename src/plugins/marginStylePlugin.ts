import { StylePlugin } from "./stylePlugin";
import { MarginContract } from "../contracts";


export class MarginStylePlugin extends StylePlugin {
    public readonly name = "margin";

    public async contractToJss(contract: MarginContract): Promise<Object> {
        return {
            marginTop: this.parseSize(contract.top),
            marginLeft: this.parseSize(contract.left),
            marginRight: this.parseSize(contract.right),
            marginBottom: this.parseSize(contract.bottom)
        };
    }
}