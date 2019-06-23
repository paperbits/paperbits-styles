import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { BorderContract, ColorContract, ThemeContract } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class BorderStylePlugin extends StylePlugin {
    public readonly name: string = "border";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToStyleRules(contract: BorderContract): Promise<StyleRule[]> {
        const result = [];

        if (contract.top && contract.top.width && contract.top.style && contract.top.colorKey) {
            const borderTopColorContract = Objects.getObjectAt<ColorContract>(contract.top.colorKey, this.themeContract);
            result.push(new StyleRule("borderTop", `${this.parseSize(contract.top.width)} ${contract.top.style} ${borderTopColorContract.value}`));
        }
        else {
            result.push(new StyleRule("borderTop", "none"));
        }

        if (contract.left && contract.left.width && contract.left.style && contract.left.colorKey) {
            const borderLeftColorContract = Objects.getObjectAt<ColorContract>(contract.left.colorKey, this.themeContract);
            result.push(new StyleRule("borderLeft", `${this.parseSize(contract.left.width)} ${contract.left.style} ${borderLeftColorContract.value}`));
        }
        else {
            result.push(new StyleRule("borderLeft", "none"));
        }

        if (contract.right && contract.right.width && contract.right.style && contract.right.colorKey) {
            const borderRightColorContract = Objects.getObjectAt<ColorContract>(contract.right.colorKey, this.themeContract);
            result.push(new StyleRule("borderRight", `${this.parseSize(contract.right.width)} ${contract.right.style} ${borderRightColorContract.value}`));
        }
        else {
            result.push(new StyleRule("borderRight", "none"));
        }

        if (contract.bottom && contract.bottom.width && contract.bottom.style && contract.bottom.colorKey) {
            const borderBottomColorContract = Objects.getObjectAt<ColorContract>(contract.bottom.colorKey, this.themeContract);
            result.push(new StyleRule("borderBottom", `${this.parseSize(contract.bottom.width)} ${contract.bottom.style}, ${borderBottomColorContract.value}`));
        }
        else {
            result.push(new StyleRule("borderBottom", "none"));
        }

        return result;
    }
}