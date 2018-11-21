import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, BackgroundContract, ColorContract } from "../contracts";
import { IPermalinkResolver } from "@paperbits/common/permalinks";

export class BackgroundStylePlugin extends StylePlugin {
    public displayName = "Background";

    constructor(
        private readonly themeContract: ThemeContract,
        private readonly permalinkResolver: IPermalinkResolver
    ) {
        super();
    }

    public async compile(contract: BackgroundContract): Promise<object> {
        // background: linear-gradient(to right, red 0%, green 100%)

        const background: any = {};

        if (contract.sourceKey) {
            const sourceUrl = await this.permalinkResolver.getUrlByPermalinkKey(contract.sourceKey);
            background.image = `url("${sourceUrl}")`;
            background.position = contract.position;
            background.size = contract.size;
            background.repeat = contract.repeat;
        }

        if (contract.colorKey) {
            background.color = Utils.getObjectAt<ColorContract>(contract.colorKey, this.themeContract).value;
        }

        return { background: background };
    }
}