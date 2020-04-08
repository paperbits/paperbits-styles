import * as ko from "knockout";
import template from "./gradientEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { LinearGradientContract, LinearGradientColorStopContract, getLinearGradientString } from "../../contracts";
import { LinearGradientViewModel, ColorStopViewModel } from "./linearGradientViewModel";
import { Style, StyleSheet, StyleRule } from "@paperbits/common/styles";


@Component({
    selector: "gradient-editor",
    template: template
})
export class GradientEditor {
    public readonly gradientPreview: ko.Observable<Object>;
    public readonly gradientViewModel: ko.Observable<LinearGradientViewModel>;

    public direction: ko.Observable<number>;
    public initialOffset: number;
    private sliderWidth: number;

    @Param()
    public readonly selectedGradient: ko.Observable<LinearGradientContract>;

    @Event()
    public readonly onSelect: (gradient: LinearGradientContract) => void;

    constructor() {
        this.initialize = this.initialize.bind(this);

        this.gradientPreview = ko.observable<string>();
        this.gradientViewModel = ko.observable();
        this.selectedGradient = ko.observable();
        this.direction = ko.observable<number>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.gradientViewModel(new LinearGradientViewModel(this.selectedGradient()));

        this.direction(parseFloat(this.gradientViewModel().direction()));
        this.direction.subscribe(deg => {
            this.gradientViewModel().direction(deg + "deg");
            this.applyChanges();
            this.updateOnSelect();
        });

        this.attachFunction();
        this.updateBackground();
    }

    public async attachFunction(): Promise<void> {
        const gradient = this.gradientViewModel();

        gradient.displayName.subscribe(() => {
            this.applyChanges();
            this.updateOnSelect();
        });
        gradient.direction.subscribe(this.applyChanges);
        gradient.colorStops().forEach((colorStop) => {
            colorStop.color.subscribe(this.applyChanges);
            colorStop.length.subscribe(this.applyChanges);
        });
    }

    public initializePointer(element: HTMLElement, colorStop: ColorStopViewModel): boolean {
        this.sliderWidth = element.parentElement.getBoundingClientRect().width;
        const length = colorStop.length();
        const position = this.sliderWidth * 1.0 / 100 * length - 4;
        element.style.left= position + "px";
        element.style.backgroundColor = colorStop.color();
        return true;
    } 

    public async addColor(): Promise<void> {
        const newColor = new ColorStopViewModel(<LinearGradientColorStopContract> {
            color: "#000000",
            length: 0
        })
        newColor.color.subscribe(this.applyChanges);
        newColor.length.subscribe(this.applyChanges);
        this.gradientViewModel().colorStops.push(newColor);
        this.updateOnSelect();
    }

    private async applyChanges(): Promise<void> {
        const gradient = this.selectedGradient();
        const colorStops: LinearGradientColorStopContract[] = [];

        gradient.displayName = this.gradientViewModel().displayName();
        gradient.direction = parseFloat(this.gradientViewModel().direction()) + "deg";
        this.gradientViewModel().colorStops().forEach((colorStop) => {
            colorStops.push(<LinearGradientColorStopContract>{
                color: colorStop.color(),
                length: colorStop.length()
            });
        });

        gradient.colorStops = colorStops;
        this.updateBackground();
    }

    private async updateBackground(): Promise<void> {
        const style = new Style("gradient-preview");
        style.addRules([new StyleRule("backgroundImage", getLinearGradientString(this.selectedGradient()))]);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.gradientPreview(styleSheet);
    }

    public changeColor(obIndex: ko.Observable<number>, colorValue: string): void {
        const index = obIndex();
        this.gradientViewModel().colorStops()[index].color(colorValue);
        this.updateOnSelect();
    }


    public onMouseMove(element: HTMLElement, position: number, index: number): void {
        const length = (position + 4) / this.sliderWidth * 100;
        this.gradientViewModel().colorStops()[index].length(length);
    }

    public updateOnSelect(): void {
        if (this.onSelect) {
            this.onSelect(this.selectedGradient());
        }
    }
}