import * as ko from "knockout";
import template from "./typography.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { TypographyContract, FontContract, ColorContract, ShadowContract } from "../../contracts";


@Component({
    selector: "typography",
    template: template,
    injectable: "typography"
})
export class Typography {
    public fontKey: KnockoutObservable<any>;
    public fontSize: KnockoutObservable<any>;
    public fontWeight: KnockoutObservable<any>;
    public fontStyle: KnockoutObservable<any>;
    public colorKey: KnockoutObservable<any>;
    public shadowKey: KnockoutObservable<any>;
    public textAlign: KnockoutObservable<any>;

    @Param()
    public typography: KnockoutObservable<TypographyContract>;

    @Event()
    public onUpdate: (contract: TypographyContract) => void;

    constructor() {
        this.init = this.init.bind(this);
        this.onFontSelected = this.onFontSelected.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onShadowSelected = this.onShadowSelected.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
        this.toggleBold = this.toggleBold.bind(this);
        this.toggleItalic = this.toggleItalic.bind(this);

        this.typography = ko.observable();

        this.fontKey = ko.observable();
        this.fontSize = ko.observable();
        this.fontWeight = ko.observable();
        this.fontStyle = ko.observable();
        this.colorKey = ko.observable();
        this.shadowKey = ko.observable();
        this.textAlign = ko.observable();
    }

    @OnMounted()
    public init(): void {
        const typography = this.typography();

        if (typography) {
            this.fontKey(typography.fontKey);
            this.fontSize(typography.fontSize);
            this.fontWeight(typography.fontWeight);
            this.fontStyle(typography.fontStyle);
            this.colorKey(typography.colorKey);
            this.shadowKey(typography.shadowKey);
            this.textAlign(typography.textAlign);
        }

        this.fontKey.subscribe(this.applyChanges);
        this.fontWeight.subscribe(this.applyChanges);
        this.fontStyle.subscribe(this.applyChanges);
        this.fontSize.subscribe(this.applyChanges);
        this.colorKey.subscribe(this.applyChanges);
        this.shadowKey.subscribe(this.applyChanges);
        this.textAlign.subscribe(this.applyChanges);
    }

    public onFontSelected(fontContract: FontContract): void {
        this.fontKey(fontContract ? fontContract.key : null);
    }

    public onColorSelected(colorContract: ColorContract): void {
        this.colorKey(colorContract ? colorContract.key : null);
    }

    public onShadowSelected(shadowContract: ShadowContract): void {
        this.shadowKey(shadowContract ? shadowContract.key : null);
    }

    public toggleBold(): void {
        const weight = this.fontWeight();
        this.fontWeight(weight !== "bold" ? "bold" : "normal");
    }

    public toggleItalic(): void {
        const style = this.fontStyle();
        this.fontStyle(style !== "italic" ? "italic" : "normal");
    }

    public alignLeft(): void {
        this.textAlign("left");
    }

    public alignCenter(): void {
        this.textAlign("center");
    }

    public alignRight(): void {
        this.textAlign("right");
    }

    public justify(): void {
        this.textAlign("justify");
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            this.onUpdate({
                fontKey: this.fontKey(),
                fontSize: parseInt(this.fontSize()),
                fontWeight: this.fontWeight(),
                fontStyle: this.fontStyle(),
                colorKey: this.colorKey(),
                shadowKey: this.shadowKey(),
                textAlign: this.textAlign()
            });
        }
    }
}