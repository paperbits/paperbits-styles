import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import template from "./fontEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { FontContract } from "../../contracts/fontContract";
import { StyleSheet, FontFace } from "@paperbits/common/styles";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ViewManager } from "@paperbits/common/ui";
import { IBlobStorage } from "@paperbits/common/persistence";
import { FontVariantContract } from "../../contracts";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { EventManager } from "@paperbits/common/events";


interface Variant {
    name: string;
    displayName: string;
    weight: string | number;
    style: string;
}

const possibleVariants: Variant[] = [
    {
        name: "Thin",
        displayName: "Thin 100",
        weight: 100,
        style: "normal"
    },
    {
        name: "ThinItalic",
        displayName: "Thin 100 italic",
        weight: 100,
        style: "italic"
    },
    {
        name: "ExtraLight",
        displayName: "Extra-light 200",
        weight: 200,
        style: "normal"
    },
    {
        name: "ExtraLightItalic",
        displayName: "Extra-light 200 italic",
        weight: 200,
        style: "italic"
    },
    {
        name: "Light",
        displayName: "Light 300",
        weight: 300,
        style: "normal"
    },
    {
        name: "LightItalic",
        displayName: "Light 300 italic",
        weight: 300,
        style: "italic"
    },
    {
        name: "Regular",
        displayName: "Regular 400",
        weight: 400,
        style: "normal"
    },
    {
        name: "RegularItalic",
        displayName: "Regular 400 italic",
        weight: 400,
        style: "italic"
    },
    {
        name: "Medium",
        displayName: "Medium 500",
        weight: 500,
        style: "normal"
    },
    {
        name: "MediumItalic",
        displayName: "Medium 500 italic",
        weight: 500,
        style: "italic"
    },
    {
        name: "SemiBold",
        displayName: "Semi-bold 600",
        weight: 600,
        style: "normal"
    },
    {
        name: "SemiBoldItalic",
        displayName: "Semi-bold 600 italic",
        weight: 600,
        style: "italic"
    },
    {
        name: "Bold",
        displayName: "Bold 700",
        weight: 700,
        style: "normal"
    },
    {
        name: "BoldItalic",
        displayName: "Bold 700 italic",
        weight: 700,
        style: "italic"
    },
    {
        name: "ExtraBold",
        displayName: "Extra-bold 800",
        weight: 800,
        style: "normal"
    },
    {
        name: "ExtraBoldItalic",
        displayName: "Extra-bold 800 italic",
        weight: 800,
        style: "italic"
    },
    {
        name: "Black",
        displayName: "Black 900",
        weight: 900,
        style: "normal"
    },
    {
        name: "BlackItalic",
        displayName: "Black 900 italic",
        weight: 900,
        style: "italic"
    }
];

@Component({
    selector: "font-editor",
    template: template
})
export class FontEditor {
    private readonly variants: ko.ObservableArray;
    public readonly displayName: ko.Observable<string>;
    public readonly preview: ko.Observable<StyleSheet>;
    public readonly previewText: ko.Observable;

    constructor(
        private readonly permalinkResolver: IPermalinkResolver,
        private readonly viewManager: ViewManager,
        private readonly blobStorage: IBlobStorage,
        private readonly eventManager: EventManager
    ) {
        this.variants = ko.observableArray();
        this.displayName = ko.observable();
        this.preview = ko.observable();
        this.previewText = ko.observable("AaBbCcDdEeFfGg"); // HhIiJjKkLlMmNnOoPpQqRrSzTtUuVvWwXxYyZz");
    }

    @Param()
    public readonly font: FontContract;

    @Event()
    public readonly onChange: () => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.displayName(this.font.displayName);

        this.displayName
            .extend(ChangeRateLimit)
            .subscribe(this.applyChanges);

        await this.buildPreview();

        this.eventManager.dispatchEvent("displayHint", {
            key: "4e45",
            content: `A font consists of one or more font faces. In the Font editor, you can upload and associate font faces to particular weights and styles.`
        });
    }

    private async buildPreview(): Promise<void> {
        const previewCss = await this.getVariantCss();
        this.preview(previewCss);
        this.variants([]);
        this.variants(possibleVariants);
    }

    public isVariantDefined(variant: Variant): boolean {
        const isDefined = this.font.variants.some(x => x.weight.toString() === variant.weight.toString() && x.style === variant.style);
        return isDefined;
    }

    public async getVariantCss(): Promise<StyleSheet> {
        const font = this.font;
        const styleSheet = new StyleSheet();

        for (const variant of font.variants) {
            let fontVariantUrl;

            if (variant.sourceKey) {
                fontVariantUrl = await this.permalinkResolver.getUrlByTargetKey(variant.sourceKey);
            }
            else if (variant.permalink || variant.file) {
                fontVariantUrl = variant.permalink || variant.file;
            }
            else {
                throw new Error("Font variant URL is empty.");
            }

            const fontFace = new FontFace();
            fontFace.fontFamily = font.family;
            fontFace.src = fontVariantUrl;
            fontFace.fontStyle = variant.style || "normal";
            fontFace.fontWeight = variant.weight || "normal";
            styleSheet.fontFaces.push(fontFace);
        }

        return styleSheet;
    }

    public async addVariant(variant: Variant): Promise<void> {
        const files = await this.viewManager.openUploadDialog(".ttf", ".otf", "woff");
        const file = files[0];
        const content = await Utils.readFileAsByteArray(file);
        const identifier = Utils.guid();
        const fileNameParts = file.name.split(".");
        const extension = fileNameParts.length > 1 ? `.${fileNameParts.pop()}` : "";

        const blobKey = `fonts/${identifier}${extension}`;
        const variantIndex = this.font.variants.findIndex(x => x.weight.toString() === variant.weight.toString() && x.style === variant.style);

        try {
            await this.blobStorage.uploadBlob(blobKey, content, "font/ttf");
        }
        catch (error) {
            console.error(`Could not upload font variant blob. ${error.stack}`);
        }

        const fontVariant: FontVariantContract = {
            weight: variant.weight,
            style: variant.style,
            sourceKey: blobKey
        };

        if (variantIndex >= 0) {
            this.font.variants[variantIndex] = fontVariant;
        }
        else {
            this.font.variants.push(fontVariant);
        }

        await this.buildPreview();

        this.applyChanges();
    }

    public async removeVariant(variant: Variant): Promise<void> {
        const fontVariant = this.font.variants.find(x => x.weight.toString() === variant.weight.toString() && x.style === variant.style);

        if (!fontVariant) {
            return;
        }

        const index = this.font.variants.indexOf(fontVariant);
        this.font.variants.splice(index, 1);

        if (fontVariant.sourceKey) {
            try {
                await this.blobStorage.deleteBlob(fontVariant.sourceKey);
            }
            catch (error) {
                console.error(`Could not delete font variant blob. ${error.stack}`);
            }
        }

        await this.buildPreview();
        this.applyChanges();
    }

    private applyChanges(): void {
        this.font.displayName = this.displayName();

        if (this.onChange) {
            this.onChange();
        }
    }
}