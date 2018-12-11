import * as Utils from "@paperbits/common/utils";
import { StylePlugin } from "./stylePlugin";
import { StyleService } from "../";
import { BackgroundContract, ColorContract, LinearGradientContract, getLinearGradientString } from "../contracts";
import { IPermalinkResolver } from "@paperbits/common/permalinks";

export class BackgroundStylePlugin extends StylePlugin {
    public displayName = "Background";

    constructor(
        private readonly styleService: StyleService,
        private readonly permalinkResolver: IPermalinkResolver
    ) {
        super();
    }

    public async contractToJss(contract: BackgroundContract): Promise<Object> {
        const background: any = {};
        const backgroundImage = [];
        const backgroundPosition = [];
        const backgroundRepeat = [];
        const backgroundSize = [];

        const themeContract = await this.styleService.getStyles();

        if (contract.colorKey) {
            background.color = Utils.getObjectAt<ColorContract>(contract.colorKey, themeContract).value;
        }

        if (contract.images && contract.images.length > 0) {
            for (const image of contract.images) {
                const sourceUrl = await this.permalinkResolver.getUrlByPermalinkKey(image.sourceKey);
                backgroundImage.push(`url("${sourceUrl}")`);
                backgroundPosition.push(image.position || "center");
                backgroundSize.push(image.size || "contain");
                backgroundRepeat.push(image.repeat || "no-repeat");
            }
        }

        if (contract.gradientKey) {
            const gradient = Utils.getObjectAt<LinearGradientContract>(contract.gradientKey, themeContract);
            backgroundImage.push(getLinearGradientString(gradient));
        }

        if (backgroundImage.length > 0) {
            background.image = backgroundImage.join(",");
        }

        if (backgroundPosition.length > 0) {
            background.position = backgroundPosition.join(",");
        }

        if (backgroundSize.length > 0) {
            background.size = backgroundSize.join(",");
        }

        if (backgroundRepeat.length > 0) {
            background.repeat = backgroundRepeat.join(",");
        }

        return { background: background };
    }
}