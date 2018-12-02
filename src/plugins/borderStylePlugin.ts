import { StylePlugin } from "./stylePlugin";
import { BorderContract } from "../contracts";

export class BorderStylePlugin extends StylePlugin {
    public displayName = "Border";

    public async contractToJss(contract: BorderContract): Promise<Object> {
        const result = {
            borderTop: contract.top ? [contract.top.width, contract.top.style, contract.top.color] : "none",
            borderLeft: contract.left ? [contract.left.width, contract.left.style, contract.left.color] : "none",
            borderRight: contract.right ? [contract.right.width, contract.right.style, contract.right.color] : "none",
            borderBottom: contract.bottom ? [contract.bottom.width, contract.bottom.style, contract.bottom.color] : "none",
        };

        return result;
    }
}