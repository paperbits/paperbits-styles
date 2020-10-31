import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { Logger } from "@paperbits/common/logging";
import { StyleService } from "../styleService";
import { FontContract } from "../contracts";


export class FontPublisher implements IPublisher {
    constructor(
        private readonly styleService: StyleService,
        private readonly blobStorage: IBlobStorage,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly logger: Logger
    ) { }

    private async renderFontFile(font: FontContract): Promise<void> {
        this.logger.trackEvent("Publishing", { message: `Publishing font ${font.displayName}...` });

        try {
            for (const variant of font.variants) {
                const blobKey = variant.sourceKey || variant.sourceId;
                const blob = await this.blobStorage.downloadBlob(blobKey);

                if (blob) {
                    await this.outputBlobStorage.uploadBlob(variant.permalink, blob, "font/ttf");
                    continue;
                }

                this.logger.trackEvent("Publishing", { message: `Could not find blob for a font variant ${blobKey}.` });
            }
        }
        catch (error) {
            this.logger.trackEvent("Publishing", { message: `Could not publish icon font: ${error.stack}` });
        }
    }

    public async publish(): Promise<void> {
        const iconFont = await this.styleService.getIconFont();
        await this.renderFontFile(iconFont);
    }
}