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
    public readonly selectedColor: KnockoutObservable<ColorContract>;

    @Event()
    public readonly onSelect: (color: ColorContract) => void;

    public colors: KnockoutObservableArray<ColorContract>;

    constructor(private readonly styleService: StyleService) {
        this.loadColors = this.loadColors.bind(this);
        this.selectColor = this.selectColor.bind(this);

        this.colors = ko.observableArray();
        this.selectedColor = ko.observable();
    }

    @OnMounted()
    public async loadColors(): Promise<void> {
        const themeContract = await this.styleService.getStyles();

        const colors = Object.keys(themeContract.colors).map((key) => {
            const colorContract = themeContract.colors[key];
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

    public addColor(): void {
        debugger;
    }
}