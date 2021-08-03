import * as Objects from "@paperbits/common";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { StylePlugin } from "../stylePlugin";
import { BackgroundStylePluginConfig, ColorContract, LinearGradientContract, getLinearGradientString, ThemeContract } from "../../contracts";
import { StyleRule } from "@paperbits/common/styles";
// import { MediaService } from "@paperbits/common/media";

export class BackgroundStylePlugin extends StylePlugin {
    private themeContract: ThemeContract;
    public readonly name: string = "background";

    constructor(
        // private readonly mediaService: MediaService,
        private readonly mediaPermalinkResolver: IPermalinkResolver
    ) {
        super();
    }

    public setThemeContract(themeContract: ThemeContract): void {
        this.themeContract = themeContract;
    }

    public async configToStyleRules(pluginConfig: BackgroundStylePluginConfig): Promise<StyleRule[]> {
        const rules = [];
        const backgroundImage = [];
        const backgroundPosition = [];
        const backgroundRepeat = [];
        const backgroundSize = [];
        const backgroundAttachment = [];
        const backgroundBlend = [];

        if (pluginConfig.colorKey) {
            const color = Objects.getObjectAt<ColorContract>(pluginConfig.colorKey, this.themeContract);

            if (color) {
                rules.push(new StyleRule("backgroundColor", color.value));
            }
            else {
                console.warn(`Color with key "${pluginConfig.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (pluginConfig.images && pluginConfig.images.length > 0) {
            for (const image of pluginConfig.images) {
                /**
                 * TODO: image-set() function is not fully supported yet (see https://caniuse.com/?search=image-set),
                 * plus it's not clear how to configure style fallbacks in JSS.
                 */

                // const media = await this.mediaService.getMediaByKey(image.sourceKey);
                // if (media.variants) {
                //     const imageSet = media.variants.map(x => `url("${x.downloadUrl}") ${x.width}w`).join(", ");
                //     backgroundImage.push(`-webkit-image-set(${imageSet})`);
                // }

                const imageUrl = await this.mediaPermalinkResolver.getUrlByTargetKey(image.sourceKey);

                if (!imageUrl) {
                    console.warn(`Unable to set background image. Media with source key ${image.sourceKey} not found.`);
                    continue;
                }

                backgroundImage.push(`url('${imageUrl}')`);
                backgroundPosition.push(image.position || "unset");
                backgroundSize.push(image.size || "unset");
                backgroundRepeat.push(image.repeat || "no-repeat");
                backgroundAttachment.push(image.attachment || "unset");
                backgroundBlend.push(image.blend || "unset");
            }
        }

        if (pluginConfig.gradientKey) {
            const gradient = Objects.getObjectAt<LinearGradientContract>(pluginConfig.gradientKey, this.themeContract);

            if (gradient) {
                backgroundImage.push(getLinearGradientString(gradient));
            }
            else {
                backgroundImage.push("none");
                console.warn(`Gradient with key "${pluginConfig.gradientKey}" not found. Elements using it will fallback to parent's definition.`);
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

        if (backgroundAttachment.length > 0) {
            rules.push(new StyleRule("backgroundAttachment", backgroundAttachment.join(",")));
        }

        if (backgroundBlend.length > 0) {
            rules.push(new StyleRule("backgroundBlendMode", backgroundBlend.join(",")));
        }

        return rules;
    }
}