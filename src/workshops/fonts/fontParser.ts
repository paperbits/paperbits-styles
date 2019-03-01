import { FontContract } from "./../../contracts/fontContract";
import * as opentype from "opentype.js";
import * as Utils from "@paperbits/common/utils";

export class FontParser {
    public static async parse(contents): Promise<FontContract> {

        let fontFamily: string;
        let fontWeight: string;
        let fontStyle: string;

        try {
            const info = opentype.parse(contents);
            fontFamily = info.names.fontFamily.en;

            const regex = /(\d*)(\w*)/gm;
            const matches = regex.exec(info.names.fontSubfamily.en);

            /* Normal weight is equivalent to 400. Bold weight is quivalent to 700. */
            fontWeight = matches[1] || "400";
            fontStyle = matches[2] || "normal";

        }
        catch (error) {
            fontFamily = "Font";
            fontWeight = "normal";
            fontStyle = "normal";
        }

        const identifier = Utils.guid();

        const fontContract: FontContract = {
            key: `fonts/${identifier}`,
            family: fontFamily,
            displayName: fontFamily,
            category: null,
            version: null,
            lastModified: (new Date()).toISOString(),
            variants: [{
                weight: fontWeight,
                style: fontStyle.toLowerCase(),
                sourceKey: identifier
            }]
        };

        return fontContract;
    }
}