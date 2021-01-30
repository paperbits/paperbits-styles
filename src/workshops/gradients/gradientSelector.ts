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
    public readonly gradients: ko.ObservableArray<GradientOption>;

    constructor(private readonly styleService: StyleService) {
        this.gradients = ko.observableArray();
        this.selectedGradientKey = ko.observable();
    }

    @Param()
    public readonly selectedGradientKey: ko.Observable<string>;

    @Event()
    public readonly onSelect: (gradient: LinearGradientContract) => void;

    @OnMounted()
    public async loadGradients(): Promise<void> {
        const gradients = await this.styleService.getGadients();

        const gradientsOptions = gradients.map((gradient) => {
            return {
                key: gradient.key,
                value: getLinearGradientString(gradient),
                gradientContract: gradient
            };
        });

        this.gradients(gradientsOptions);
    }

    public selectGradient(gradient: GradientOption): void {
        this.selectedGradientKey(gradient?.gradientContract.key);

        if (this.onSelect) {
            this.onSelect(gradient.gradientContract);
        }

        console.log(this.selectedGradientKey());
    }

    public clearGradients(): void {
        this.selectedGradientKey(null);

        console.log(this.selectedGradientKey());

        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}