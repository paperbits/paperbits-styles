import * as ko from "knockout";
import template from "./colorPickerView.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ColorContract } from "../../contracts/colorContract";

@Component({
    selector: "color-picker-view",
    template: template
})
export class ColorPickerView {

    private selectTimeout: any;

    @Param()
    public readonly colorValue: ko.Observable<string>;

    @Event()
    public readonly onSelect: (colorValue: string) => void;

    constructor() {

        this.colorValue = ko.observable();
    }

    @OnMounted()
    public async loadColors(): Promise<void> {
        this.colorValue.subscribe(this.onColorChange);
    }

    public onColorChange(): void {
        clearTimeout(this.selectTimeout);
        this.selectTimeout = setTimeout(() => this.scheduleColorUpdate(), 50);
    }

    private scheduleColorUpdate(): void {
        if (this.onSelect) {
            this.onSelect(this.colorValue());
        }
    }
}