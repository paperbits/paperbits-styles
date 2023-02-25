import { PrimitiveContract } from "@paperbits/common/styles";
import { FontVariantContract } from "./fontVariantContract";


export interface FontContract extends PrimitiveContract {
    /**
     * e.g. "webfonts#webfont".
     */
    kind?: string;

    /**
     * e.g. "Advent Pro".
     */
    family: string;

    /**
     * e.g. "sans-serif"
     */
    category?: string;

    /**
     * e.g. [400, 500, "regular", "500", "500italic"].
     */
    variants?: FontVariantContract[];

    /**
     * e.g. "v7"
     */
    version?: string;

    /**
     * e.g. "2017-10-10".
     */
    lastModified?: string;
}
