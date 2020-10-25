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
        try {
            for (const variant of font.variants) {
                const blob = await this.blobStorage.downloadBlob(variant.sourceKey);

                if (blob) {
                    await this.outputBlobStorage.uploadBlob(variant.permalink, blob, "font/ttf");
                }
            }
        }
        catch (error) {
            this.logger.trackEvent("Publishing", { message: `Could not publish icon font: ${error.stack}` });
        }
    }

    public async publish(): Promise<void> {
        const iconFont = await this.styleService.getIconFont();
        this.renderFontFile(iconFont);
    }
}