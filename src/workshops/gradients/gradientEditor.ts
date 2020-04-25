import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import template from "./gradientEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { LinearGradientContract, LinearGradientColorStopContract, getLinearGradientString } from "../../contracts";
import { LinearGradientViewModel, ColorStopViewModel } from "./linearGradientViewModel";
import { Style, StyleSheet, StyleRule } from "@paperbits/common/styles";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";


@Component({
    selector: "gradient-editor",
    template: template
})
export class GradientEditor {
    public readonly gradientPreview: ko.Observable<Object>;
    public readonly gradientPreviewColorStops: ko.Observable<Object>;
    public readonly gradientViewModel: ko.Observable<LinearGradientViewModel>;
    public readonly direction: ko.Observable<number>;

    @Param()
    public readonly selectedGradient: ko.Observable<LinearGradientContract>;

    @Event()
    public readonly onSelect: (gradient: LinearGradientContract) => void;

    constructor() {
        this.gradientPreview = ko.observable<string>();
        this.gradientPreviewColorStops = ko.observable<string>();
        this.gradientViewModel = ko.observable();
        this.selectedGradient = ko.observable();
        this.direction = ko.observable<number>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.gradientViewModel(new LinearGradientViewModel(this.selectedGradient()));

        this.direction(parseFloat(this.gradientViewModel().direction()));

        this.direction.extend(ChangeRateLimit).subscribe(deg => {
            this.gradientViewModel().direction(deg + "deg");
        });

        this.gradientPreviewColorStops.extend(ChangeRateLimit).subscribe(this.applyChanges);

        this.attachFunction();
        this.updatePreview();
        this.updateColorStopsPreview();
    }

    public async attachFunction(): Promise<void> {
        const gradient = this.gradientViewModel();

        gradient.displayName.extend(ChangeRateLimit).subscribe(() => {
            this.applyChanges();
        });
        gradient.direction.extend(ChangeRateLimit).subscribe(this.applyChanges);
    }

    public async addColor(): Promise<void> {
        const newColor = new ColorStopViewModel(<LinearGradientColorStopContract>{
            color: "#000000",
            length: 0
        });
        newColor.color.extend(ChangeRateLimit).subscribe(this.applyChanges);
        newColor.length.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.gradientViewModel().colorStops.push(newColor);

        this.applyChanges();
    }

    private async applyChanges(): Promise<void> {
        this.updatePreview();

        if (this.onSelect) {
            const gradient = this.gradientViewModel().toContract();
            this.onSelect(gradient);
        }
    }

    private async updatePreview(): Promise<void> {
        const previewGradient = this.gradientViewModel().toContract();
        const style = new Style("gradient-preview");
        style.addRules([new StyleRule("backgroundImage", getLinearGradientString(previewGradient))]);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.gradientPreview(styleSheet);
    }

    private async updateColorStopsPreview(): Promise<void> {
        const colorStopsGradient = this.gradientViewModel().toContract();
        const colorStopsPreviewStyle = new Style("gradient-preview-color-stops");

        colorStopsGradient.direction = "90deg";
        colorStopsPreviewStyle.addRules([new StyleRule("backgroundImage", getLinearGradientString(colorStopsGradient))]);

        const colorStopsPreviewStyleSheet = new StyleSheet();
        colorStopsPreviewStyleSheet.styles.push(colorStopsPreviewStyle);

        this.gradientPreviewColorStops(colorStopsPreviewStyleSheet);
    }

    public changeColor(obIndex: ko.Observable<number>, colorValue: string): void {
        const index = obIndex();

        if (!colorValue) {
            this.gradientViewModel().colorStops.splice(index, 1);
        }
        else {
            this.gradientViewModel().colorStops()[index].color(colorValue);
        }

        this.updateColorStopsPreview();
    }

    public onColorStopChange(): void {
        this.updateColorStopsPreview();
    }
}