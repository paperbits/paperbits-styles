import { IPermalinkResolver } from "@paperbits/common/permalinks";


export class FontPermalinkResolver implements IPermalinkResolver {
    public canHandleTarget(fontSourceKey: string): boolean {
        if (!fontSourceKey) {
            throw new Error(`Parameter "fontSourceKey" not specified.`);
        }

        return fontSourceKey.startsWith("fonts/");
    }

    public async getUrlByTargetKey(fontSourceKey: string): Promise<string> {
        if (!fontSourceKey) {
            throw new Error(`Parameter "fontSourceKey" not specified.`);
        }

        return `/${fontSourceKey}`;
    }
}