import * as ko from "knockout";
import template from "./colorPickerView.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ColorContract } from "../../contracts/colorContract";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "color-picker-view",
    template: template
})
export class ColorPickerView {

    @Param()
    public readonly colorValue: ko.Observable<string>;

    @Event()
    public readonly onSelect: (colorValue: string) => void;

    constructor() {

        this.colorValue = ko.observable();
    }

    @OnMounted()
    public async loadColors(): Promise<void> {
        this.colorValue
            .extend(ChangeRateLimit)
            .subscribe(this.scheduleColorUpdate)
    }

    private scheduleColorUpdate(): void {
        if (this.onSelect) {
            this.onSelect(this.colorValue());
        }
    }
}