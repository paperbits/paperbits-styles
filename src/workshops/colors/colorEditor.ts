import * as ko from "knockout";
import template from "./colorEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ColorContract } from "../../contracts/colorContract";

@Component({
    selector: "color-editor",
    template: template,
    injectable: "colorEditor"
})
export class ColorEditor {
    public colorName: KnockoutObservable<string>;
    public colorValue: KnockoutObservable<string>;

    @Param()
    public readonly selectedColor: KnockoutObservable<ColorContract>;

    @Event()
    public readonly onSelect: (color: ColorContract) => void;

    constructor(private readonly styleService: StyleService) {
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
        const colorContract = this.selectedColor();
        colorContract.value  = this.colorValue();
        colorContract.displayName = this.colorName();

        this.onSelect(colorContract);
    }
}