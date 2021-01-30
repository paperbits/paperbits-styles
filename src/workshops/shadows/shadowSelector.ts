import * as ko from "knockout";
import template from "./shadowSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ShadowContract } from "../../contracts/shadowContract";


@Component({
    selector: "shadow-selector",
    template: template
})
export class ShadowSelector {
    public readonly shadows: ko.ObservableArray<ShadowContract>;

    constructor(private readonly styleService: StyleService) {
        this.loadShadows = this.loadShadows.bind(this);
        this.selectShadow = this.selectShadow.bind(this);

        this.shadows = ko.observableArray();
        this.selectedShadow = ko.observable();
    }

    @Param()
    public readonly selectedShadow: ko.Observable<ShadowContract>;

    @Event()
    public readonly onSelect: (shadow: ShadowContract) => void;

    @OnMounted()
    public async loadShadows(): Promise<void> {
        const shadows = await this.styleService.getShadows();
        this.shadows(shadows);
    }

    public selectShadow(shadow: ShadowContract): void {
        if (this.selectedShadow) {
            this.selectedShadow(shadow);
        }

        if (this.onSelect) {
            this.onSelect(shadow);
        }
    }

    public clearShadow(): void {
        if (this.selectedShadow) {
            this.selectedShadow(null);
        }

        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}