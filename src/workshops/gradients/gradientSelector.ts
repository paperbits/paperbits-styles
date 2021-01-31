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
                displayName: gradient.displayName,
                value: getLinearGradientString(gradient),
                contract: gradient
            };
        });

        this.gradients(gradientsOptions);
    }

    public selectGradient(option: GradientOption): void {
        this.selectedGradientKey(option?.contract.key);

        if (this.onSelect) {
            this.onSelect(option.contract);
        }
    }

    public clearGradients(): void {
        this.selectedGradientKey(null);

        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}