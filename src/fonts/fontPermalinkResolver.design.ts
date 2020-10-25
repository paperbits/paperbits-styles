import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IconsFontFileSourceKey } from "../constants";


export class FontPermalinkResolver implements IPermalinkResolver {
    constructor(private readonly blobStorage: IBlobStorage) { }

    public canHandleTarget(targetKey: string): boolean {
        return targetKey === IconsFontFileSourceKey; // Only icon font for now.
    }

    public async getUrlByTargetKey(fontSourceKey: string): Promise<string> {
        if (!fontSourceKey) {
            throw new Error(`Parameter "fontSourceKey" not specified.`);
        }

        const downloadUrl = await this.blobStorage.getDownloadUrl(IconsFontFileSourceKey);

        return downloadUrl;
    }
}