import * as ko from "knockout";
import template from "./colorSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ColorContract } from "../../contracts/colorContract";

@Component({
    selector: "color-selector",
    template: template
})
export class ColorSelector {
    public readonly colors: ko.ObservableArray<ColorContract>;

    constructor(private readonly styleService: StyleService) {
        this.colors = ko.observableArray();
        this.selectedColor = ko.observable();
        this.selectedColorKey = ko.observable();
    }

    @Param()
    public readonly selectedColor: ko.Observable<ColorContract>;

    @Param()
    public readonly selectedColorKey: ko.Observable<string>;

    @Event()
    public readonly onSelect: (color: ColorContract) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const colors = await this.styleService.getColors();
        this.colors(colors);
    }

    public selectColor(color: ColorContract): void {
        this.selectedColor(color);
        this.selectedColorKey(color?.key);

        if (this.onSelect) {
            this.onSelect(color);
        }
    }

    public clearColors(): void {
        this.selectedColorKey(null);

        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}