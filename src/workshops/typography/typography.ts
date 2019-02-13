import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./typography.html";
import { StyleService } from "../../styleService";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { TypographyContract, FontContract, ColorContract, ShadowContract } from "../../contracts";


const inheritLabel = "(Inherit)";

@Component({
    selector: "typography",
    template: template,
    injectable: "typography"
})
export class Typography {
    public fontKey: ko.Observable<any>;
    public fontSize: ko.Observable<any>;
    public fontWeight: ko.Observable<any>;
    public fontStyle: ko.Observable<any>;
    public lineHeight: ko.Observable<any>;
    public colorKey: ko.Observable<any>;
    public shadowKey: ko.Observable<any>;
    public textAlign: ko.Observable<any>;
    public textTransform: ko.Observable<any>;
    public fontName: ko.Observable<string>;
    public colorName: ko.Observable<string>;
    public shadowName: ko.Observable<string>;

    public textTransformOptions = [
        { value: undefined, text: "(Inherit)" },
        { value: "capitalize", text: "Capitalize" },
        { value: "lowercase", text: "Lower-case" },
        { value: "uppercase", text: "Upper-case" }
    ];

    @Param()
    public typography: ko.Observable<TypographyContract>;

    @Event()
    public onUpdate: (contract: TypographyContract) => void;

    constructor(private readonly styleService: StyleService) {
         this.typography = ko.observable();
        this.fontKey = ko.observable();
        this.fontSize = ko.observable();
        this.fontWeight = ko.observable();
        this.fontStyle = ko.observable();
        this.lineHeight = ko.observable();
        this.colorKey = ko.observable();
        this.shadowKey = ko.observable();
        this.textAlign = ko.observable();
        this.textTransform = ko.observable();
        this.fontName = ko.observable();
        this.colorName = ko.observable();
        this.shadowName = ko.observable();
    }

    private async fillout(typographyContract: TypographyContract): Promise<void> {
        if (!typographyContract) {
            return;
        }

        const styles = await this.styleService.getStyles();

        if (typographyContract.fontKey) {
            const fontContract = Objects.getObjectAt<FontContract>(typographyContract.fontKey, styles);

            if (fontContract) {
                this.fontName(fontContract.displayName);
                this.fontKey(typographyContract.fontKey);
            }
            else {
                console.warn(`Font with key "${typographyContract.fontKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (typographyContract.colorKey) {
            const colorContract = Objects.getObjectAt<FontContract>(typographyContract.colorKey, styles);

            if (colorContract) {
                this.colorName(colorContract.displayName);
                this.colorKey(typographyContract.colorKey);
            }
            else {
                console.warn(`Color with key "${typographyContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        this.fontSize(typographyContract.fontSize);
        this.fontWeight(typographyContract.fontWeight);
        this.fontStyle(typographyContract.fontStyle);
        this.textTransform(typographyContract.textTransform);

        if (typographyContract.shadowKey) {
            const shadowContract = Objects.getObjectAt<FontContract>(typographyContract.shadowKey, styles);

            if (shadowContract) {
                this.shadowName(shadowContract.displayName);
                this.shadowKey(typographyContract.shadowKey);
            }
            else {
                console.warn(`Shadow with key "${typographyContract.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        this.textAlign(typographyContract.textAlign);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const typography = this.typography();

        this.fontName(inheritLabel);
        this.colorName(inheritLabel);
        this.shadowName(inheritLabel);

        await this.fillout(typography);

        this.fontKey.subscribe(this.applyChanges);
        this.fontWeight.subscribe(this.applyChanges);
        this.fontStyle.subscribe(this.applyChanges);
        this.fontSize.subscribe(this.applyChanges);
        this.lineHeight.subscribe(this.applyChanges);
        this.colorKey.subscribe(this.applyChanges);
        this.shadowKey.subscribe(this.applyChanges);
        this.textAlign.subscribe(this.applyChanges);
        this.textTransform.subscribe(this.applyChanges);
        this.typography.subscribe(this.fillout);
    }

    public onFontSelected(fontContract: FontContract): void {
        this.fontName(fontContract ? fontContract.displayName : inheritLabel);
        this.fontKey(fontContract ? fontContract.key : undefined);
    }

    public onColorSelected(colorContract: ColorContract): void {
        this.colorName(colorContract ? colorContract.displayName : inheritLabel);
        this.colorKey(colorContract ? colorContract.key : undefined);
    }

    public onShadowSelected(shadowContract: ShadowContract): void {
        this.shadowName(shadowContract ? shadowContract.displayName : inheritLabel);
        this.shadowKey(shadowContract ? shadowContract.key : undefined);
    }

    public toggleBold(): void {
        const weight = this.fontWeight();
        this.fontWeight(weight === "bold" ? undefined : "bold");
    }

    public toggleItalic(): void {
        const style = this.fontStyle();
        this.fontStyle(style === "italic" ? undefined : "italic");
    }

    public alignLeft(): void {
        const alignment = this.textAlign();
        this.textAlign(alignment === "left" ? undefined : "left");
    }

    public alignCenter(): void {
        const alignment = this.textAlign();
        this.textAlign(alignment === "center" ? undefined : "center");
    }

    public alignRight(): void {
        const alignment = this.textAlign();
        this.textAlign(alignment === "right" ? undefined : "right");
    }

    public justify(): void {
        const alignment = this.textAlign();
        this.textAlign(alignment === "justify" ? undefined : "justify");
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            this.onUpdate({
                fontKey: this.fontKey(),
                fontSize: this.fontSize() ? parseInt(this.fontSize()) : undefined,
                fontWeight: this.fontWeight(),
                fontStyle: this.fontStyle(),
                lineHeight: this.lineHeight() ? this.lineHeight() : undefined,
                colorKey: this.colorKey(),
                shadowKey: this.shadowKey(),
                textAlign: this.textAlign(),
                textTransform: this.textTransform()
            });
        }
    }
}