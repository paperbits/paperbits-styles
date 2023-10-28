import * as ko from "knockout";
import template from "./stateSelector.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";


@Component({
    selector: "state-selector",
    template: template
})
export class StateSelector {
    constructor() {
        this.selectedState = ko.observable();
    }

    @Param()
    public selectedState: ko.Observable<string>;

    @Param()
    public states: string[];

    @Event()
    public onSelect: (item: string) => void;

    @OnMounted()
    public initialize(): void { }

    public selectState(state: string): void {
        this.selectedState(state);

        if (this.onSelect) {
            this.onSelect(state);
        }
    }
}