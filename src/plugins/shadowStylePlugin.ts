import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, ShadowContract } from "../contracts";

export class ShadowStylePlugin extends StylePlugin {
    public displayName = "Box shadow";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToJss(shadow: any): Promise<Object> {
        if (!shadow || !shadow.shadowKey) {
            return {};
        }

        const shadowContract = Utils.getObjectAt<ShadowContract>(shadow.shadowKey, this.themeContract);

        const result = {
            boxShadow: {
                x: shadowContract.offsetX || 0,
                y: shadowContract.offsetY || 0,
                blur: shadowContract.blur || 0,
                spread: shadowContract.spread || 0,
                color: shadowContract.color || "#000",
                inset: shadowContract.inset ? "inset" : undefined
            }
        };

        return result;
    }
}