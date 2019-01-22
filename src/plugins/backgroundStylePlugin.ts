import * as Utils from "@paperbits/common/utils";
import { IMediaService } from "@paperbits/common/media";
import { StylePlugin } from "./stylePlugin";
import { StyleService } from "../";
import { BackgroundContract, ColorContract, LinearGradientContract, getLinearGradientString } from "../contracts";

export class BackgroundStylePlugin extends StylePlugin {
    public displayName = "Background";

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaService: IMediaService
    ) {
        super();
    }

    public async contractToJss(backgroundContract: BackgroundContract): Promise<Object> {
        const background: any = {};
        const backgroundImage = [];
        const backgroundPosition = [];
        const backgroundRepeat = [];
        const backgroundSize = [];

        const themeContract = await this.styleService.getStyles();

        if (backgroundContract.colorKey) {
            const color = Utils.getObjectAt<ColorContract>(backgroundContract.colorKey, themeContract);

            if (color) {
                background.color = color.value;
            }
            else {
                console.warn(`Color with key "${backgroundContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (backgroundContract.images && backgroundContract.images.length > 0) {
            for (const image of backgroundContract.images) {
                const media = await this.mediaService.getMediaByKey(image.sourceKey);

                if (!media) {
                    console.warn(`Unable to set background image. Media with source key ${image.sourceKey} not found.`);
                    continue;
                }

                backgroundImage.push(`url("${media.downloadUrl}")`);
                backgroundPosition.push(image.position || "unset");
                backgroundSize.push(image.size || "unset");
                backgroundRepeat.push(image.repeat || "no-repeat");
            }
        }

        if (backgroundContract.gradientKey) {
            const gradient = Utils.getObjectAt<LinearGradientContract>(backgroundContract.gradientKey, themeContract);

            if (gradient) {
                backgroundImage.push(getLinearGradientString(gradient));
            }
            else {
                backgroundImage.push("none");
                console.warn(`Gradient with key "${backgroundContract.gradientKey}" not found. Elements using it will fallback to parent's definition.`);
            }
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