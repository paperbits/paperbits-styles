import { StylePlugin } from "./stylePlugin";
import { SizeContract } from "../contracts/sizeContract";


export class SizeStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async contractToJss(contract: SizeContract): Promise<Object> {
        const result = {
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined
        };

        if (contract.minWidth) {
            result.minWidth = contract.minWidth + "px";
        }

        if (contract.minHeight) {
            result.minHeight = contract.minHeight + "px";
        }

        if (contract.maxWidth) {
            result.maxWidth = contract.maxWidth + "px";
        }

        if (contract.maxHeight) {
            result.maxHeight = contract.maxHeight + "px";
        }

        return result;
    }
}