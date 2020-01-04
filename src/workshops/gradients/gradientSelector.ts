import * as ko from "knockout";
import template from "./gradientSelector.html";
import { GradientOption } from "./gradientOptions";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { LinearGradientContract, getLinearGradientString } from "../../contracts";

@Component({
    selector: "gradient-selector",
    template: template
})
export class GradientSelector {
    @Param()
    public readonly selectedGradient: ko.Observable<LinearGradientContract>;

    @Event()
    public readonly onSelect: (gradient: LinearGradientContract) => void;

    public gradients: ko.ObservableArray<GradientOption>;

    constructor(private readonly styleService: StyleService) {
        this.loadGradients = this.loadGradients.bind(this);
        this.selectGradient = this.selectGradient.bind(this);

        this.gradients = ko.observableArray();
        this.selectedGradient = ko.observable();
    }

    @OnMounted()
    public async loadGradients(): Promise<void> {
        const themeContract = await this.styleService.getStyles();

        const gradients = Object.keys(themeContract.gradients).map((key) => {
            const gradientContract = themeContract.gradients[key];

            return {
                value: getLinearGradientString(gradientContract),
                gradientContract: gradientContract
            };
        });

        this.gradients(gradients);
    }

    public selectGradient(gradient: GradientOption): void {
        if (this.selectedGradient) {
            this.selectedGradient(gradient.gradientContract);
        }

        if (this.onSelect) {
            this.onSelect(gradient.gradientContract);
        }
    }

    public clearGradients(): void {
        if (this.selectedGradient) {
            this.selectedGradient(null);
        }

        if (this.onSelect) {
            this.onSelect(null);
        }
    }

    public addGradient(): void {
        debugger;
    }
}