import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, BackgroundContract, ColorContract } from "../contracts";

export class BackgroundStylePlugin extends StylePlugin {
    public displayName = "Background";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public compile(contract: BackgroundContract): Object {
        // background: linear-gradient(to right, red 0%, green 100%)

        return {
            background: {
                color: contract.colorKey
                    ? Utils.getObjectAt<ColorContract>(contract.colorKey, this.themeContract).value
                    : undefined
            }
        };
    }
}