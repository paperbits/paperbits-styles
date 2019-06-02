import * as ko from "knockout";
import template from "./colorEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ColorContract } from "../../contracts/colorContract";

@Component({
    selector: "color-editor",
    template: template,
    injectable: "colorEditor"
})
export class ColorEditor {
    private selectTimeout: any;
    public colorName: ko.Observable<string>;
    public colorValue: ko.Observable<string>;

    @Param()
    public readonly selectedColor: ko.Observable<ColorContract>;

    @Event()
    public readonly onSelect: (color: ColorContract) => void;

    constructor() {
        this.loadColors = this.loadColors.bind(this);
        this.onColorChange = this.onColorChange.bind(this);

        this.colorName = ko.observable();
        this.colorValue = ko.observable();

        this.selectedColor = ko.observable();
    }

    @OnMounted()
    public async loadColors(): Promise<void> {
        this.colorName(this.selectedColor().displayName);
        this.colorValue(this.selectedColor().value);

        this.colorName.subscribe(this.onColorChange);
        this.colorValue.subscribe(this.onColorChange);
    }

    public onColorChange(): void {
        const color = this.selectedColor();
        color.value = this.colorValue();
        color.displayName = this.colorName();

        clearTimeout(this.selectTimeout);
        this.selectTimeout = setTimeout(() => this.scheduleColorUpdate(color), 600);
    }

    private scheduleColorUpdate(color: ColorContract): void {
        if (this.selectedColor) {
            this.selectedColor(color);
        }

        if (this.onSelect) {
            this.onSelect(color);
        }
    }
}