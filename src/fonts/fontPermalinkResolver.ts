import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { IconsFontFileSourceKey, IconsFontPermalink } from "../constants";

export class FontPermalinkResolver implements IPermalinkResolver {
    public canHandleTarget(targetKey: string): boolean {
        return targetKey === IconsFontFileSourceKey; // Only icon font for now.
    }

    public async getUrlByTargetKey(fontSourceKey: string): Promise<string> {
        if (!fontSourceKey) {
            throw new Error(`Parameter "fontKey" not specified.`);
        }

        return IconsFontPermalink;
    }
}