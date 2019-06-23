import * as Objects from "@paperbits/common";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { StylePlugin } from "./stylePlugin";
import { StyleService } from "../";
import { BackgroundContract, ColorContract, LinearGradientContract, getLinearGradientString } from "../contracts";
import { StyleRule } from "@paperbits/common/styles";

export class BackgroundStylePlugin extends StylePlugin {
    public readonly name: string = "background";

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaPermalinkResolver: IPermalinkResolver
    ) {
        super();
    }

    public async contractToStyleRules(backgroundContract: BackgroundContract): Promise<StyleRule[]> {
        const rules = [];
        const backgroundImage = [];
        const backgroundPosition = [];
        const backgroundRepeat = [];
        const backgroundSize = [];

        const themeContract = await this.styleService.getStyles();

        if (backgroundContract.colorKey) {
            const color = Objects.getObjectAt<ColorContract>(backgroundContract.colorKey, themeContract);

            if (color) {
                rules.push(new StyleRule("backgroundColor", color.value));
            }
            else {
                console.warn(`Color with key "${backgroundContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (backgroundContract.images && backgroundContract.images.length > 0) {
            for (const image of backgroundContract.images) {
                const imageUrl = await this.mediaPermalinkResolver.getUrlByTargetKey(image.sourceKey);

                if (!imageUrl) {
                    console.warn(`Unable to set background image. Media with source key ${image.sourceKey} not found.`);
                    continue;
                }

                backgroundImage.push(`url("${imageUrl}")`);
                backgroundPosition.push(image.position || "unset");
                backgroundSize.push(image.size || "unset");
                backgroundRepeat.push(image.repeat || "no-repeat");
            }
        }

        if (backgroundContract.gradientKey) {
            const gradient = Objects.getObjectAt<LinearGradientContract>(backgroundContract.gradientKey, themeContract);

            if (gradient) {
                backgroundImage.push(getLinearGradientString(gradient));
            }
            else {
                backgroundImage.push("none");
                console.warn(`Gradient with key "${backgroundContract.gradientKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (backgroundImage.length > 0) {
            rules.push(new StyleRule("backgroundImage", backgroundImage.join(",")));
        }

        if (backgroundPosition.length > 0) {
            rules.push(new StyleRule("backgroundPosition", backgroundPosition.join(",")));
        }

        if (backgroundSize.length > 0) {
            rules.push(new StyleRule("backgroundSize", backgroundSize.join(",")));
        }

        if (backgroundRepeat.length > 0) {
            rules.push(new StyleRule("backgroundRepeat", backgroundRepeat.join(",")));
        }

        return rules;
    }
}