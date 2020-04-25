import * as ko from "knockout";
import template from "./colorStopEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "color-stop-editor",
    template: template
})
export class ColorStopEditor {
    constructor() {
        this.colorValue = ko.observable();
    }

    @Param()
    public readonly colorValue: ko.Observable<string>;

    @Event()
    public readonly onSelect: (colorValue: string) => void;

    @OnMounted()
    public async loadColors(): Promise<void> {
        this.colorValue
            .extend(ChangeRateLimit)
            .subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        if (this.onSelect) {
            this.onSelect(this.colorValue());
        }
    }

    public deleteColorStop(): void {
        this.onSelect(null);
    }
}