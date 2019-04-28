import * as ko from "knockout";
import template from "./colorSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ColorContract } from "../../contracts/colorContract";

@Component({
    selector: "color-selector",
    template: template,
    injectable: "colorSelector"
})
export class ColorSelector {
    @Param()
    public initColorKey: ko.Observable<string>;

    @Param()
    public readonly selectedColor: ko.Observable<ColorContract>;

    @Event()
    public readonly onSelect: (color: ColorContract) => void;

    public readonly colors: ko.ObservableArray<ColorContract>;

    constructor(private readonly styleService: StyleService) {
        this.loadColors = this.loadColors.bind(this);
        this.selectColor = this.selectColor.bind(this);

        this.colors = ko.observableArray();
        this.selectedColor = ko.observable();
        this.initColorKey = ko.observable();
    }

    @OnMounted()
    public async loadColors(): Promise<void> {
        const themeContract = await this.styleService.getStyles();
        const defaultColorKey = this.initColorKey();
        const colors = Object.keys(themeContract.colors).map((key) => {
            const colorContract = themeContract.colors[key];
            if (defaultColorKey && colorContract.key === defaultColorKey) {
                this.selectedColor(colorContract);
            }
            return colorContract;
        });

        this.colors(colors);
    }

    public selectColor(color: ColorContract): void {
        if (this.selectedColor) {
            this.selectedColor(color);
        }

        if (this.onSelect) {
            this.onSelect(color);
        }
    }

    public clearColors(): void {
        if (this.selectedColor) {
            this.selectedColor(null);
        }

        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}