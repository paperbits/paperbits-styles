import * as Utils from "@paperbits/common/utils";
import * as ko from "knockout";
import { Bag } from "@paperbits/common";
import { FontContract, FontVariantContract } from "./../../contracts/fontContract";
import { GoogleFontContract } from "./googleFontsParser";

export class GoogleFont {
    public identifier: string;
    public preview: KnockoutObservable<any>;
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

        const jss = {
            "@font-face": {
                fontFamily: this.family,
                src: `url(${fileName.replace("http://", "https://")})`,
                fontStyle: "normal",
                fontWeight: "normal"
            }
        };

        this.preview(jss);
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