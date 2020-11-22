import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { IBlobStorage } from "@paperbits/common/persistence";

export class FontPermalinkResolver implements IPermalinkResolver {
    constructor(private readonly blobStorage: IBlobStorage) { }

    public canHandleTarget(fontKey: string): boolean {
        if (!fontKey) {
            throw new Error(`Parameter "fontKey" not specified.`);
        }

        return fontKey.startsWith("fonts/");
    }

    public async getUrlByTargetKey(fontKey: string): Promise<string> {
        if (!fontKey) {
            throw new Error(`Parameter "fontKey" not specified.`);
        }

        const downloadUrl = await this.blobStorage.getDownloadUrl(fontKey);
        return downloadUrl;
    }
}