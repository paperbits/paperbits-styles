import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { BorderContract, ColorContract, ThemeContract } from "../contracts";

export class BorderStylePlugin extends StylePlugin {
    public readonly name = "border";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToJss(contract: BorderContract): Promise<Object> {
        const result = {};

        if (contract.top && contract.top.width && contract.top.style && contract.top.colorKey) {
            const borderTopColorContract = Objects.getObjectAt<ColorContract>(contract.top.colorKey, this.themeContract);
            result["borderTop"] = [contract.top.width + "px", contract.top.style, borderTopColorContract.value];
        }
        else {
            result["borderTop"] = "none";
        }

        if (contract.left && contract.left.width && contract.left.style && contract.left.colorKey) {
            const borderLeftColorContract = Objects.getObjectAt<ColorContract>(contract.left.colorKey, this.themeContract);
            result["borderLeft"] = [contract.left.width + "px", contract.left.style, borderLeftColorContract.value];
        }
        else {
            result["borderLeft"] = "none";
        }

        if (contract.right && contract.right.width && contract.right.style && contract.right.colorKey) {
            const borderRightColorContract = Objects.getObjectAt<ColorContract>(contract.right.colorKey, this.themeContract);
            result["borderRight"] = [contract.right.width + "px", contract.right.style, borderRightColorContract.value];
        }
        else {
            result["borderRight"] = "none";
        }

        if (contract.bottom && contract.bottom.width && contract.bottom.style && contract.bottom.colorKey) {
            const borderBottomColorContract = Objects.getObjectAt<ColorContract>(contract.bottom.colorKey, this.themeContract);
            result["borderBottom"] = [contract.bottom.width + "px", contract.bottom.style, borderBottomColorContract.value];
        }
        else {
            result["borderBottom"] = "none";
        }

        return result;
    }
}