import * as Utils from "@paperbits/common/utils";
import * as ko from "knockout";
import { Bag } from "@paperbits/common";
import { FontContract, FontVariantContract } from "./../../contracts/fontContract";
import { GoogleFontContract } from "./googleFontsParser";
import { StyleSheet, FontFace } from "@paperbits/common/styles";

export class GoogleFont {
    public identifier: string;
    public preview: ko.Observable<any>;
    public displayName: string;
    public family: string;

    private files: Bag<string>;
    private version: string;
    private category: string;
    private lastModified: string;
    private variants: string[];

    constructor(contract: GoogleFontContract) {
        this.loadPreview = this.loadPreview.bind(this);

        this.identifier = Utils.identifier();
        this.preview = ko.observable();
        this.displayName = contract.family;
        this.family = contract.family;
        this.files = contract.files;
        this.variants = contract.variants;
        this.version = contract.version;
        this.category = contract.category;
        this.lastModified = contract.lastModified;
    }

    public loadPreview(): void {
        if (this.preview()) {
            return;
        }

        const fileName = this.files["regular"] || this.files["400"] || this.files[this.variants[0]];

        const fontFace = new FontFace();
        fontFace.fontFamily = this.family;
        fontFace.src = fileName.replace("http://", "https://");
        fontFace.fontStyle = "normal";
        fontFace.fontWeight = "normal";

        const styleSheet = new StyleSheet();
        styleSheet.fontFaces.push(fontFace);

        this.preview(styleSheet);
    }

    public toContract(): FontContract {
        const fontContract: FontContract = {
            key: `fonts/${this.identifier}`,
            family: this.family,
            displayName: this.family,
            category: this.category,
            version: this.version,
            lastModified: this.lastModified,
            variants: this.variants.map(variantName => {
                const regex = /(\d*)(\w*)/gm;
                const matches = regex.exec(variantName);

                /* Normal weight is equivalent to 400. Bold weight is quivalent to 700. */
                const fontWeight = matches[1] || 400;
                const fontStyle = matches[2] || "normal";
                const fontFile = this.files[variantName];

                const fontVariant: FontVariantContract = {
                    weight: fontWeight,
                    style: fontStyle,
                    file: fontFile.replace("http://", "https://")
                };

                return fontVariant;
            })
        };

        return fontContract;
    }
}