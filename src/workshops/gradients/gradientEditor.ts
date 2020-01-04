import * as ko from "knockout";
import template from "./gradientEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { LinearGradientContract, LinearGradientColorStopContract, getLinearGradientString } from "../../contracts";


@Component({
    selector: "gradient-editor",
    template: template
})
export class GradientEditor {
    public readonly direction: ko.Observable<number>;
    public readonly colorStops: ko.ObservableArray<LinearGradientColorStopContract>;
    public readonly gradientPreview: ko.Observable<Object>;

    constructor() {
        this.initialize = this.initialize.bind(this);
        this.addColorStop = this.addColorStop.bind(this);

        this.direction = ko.observable(90);
        this.colorStops = ko.observableArray();
        this.colorStops.push({ color: "#ABDCFF", length: 0 });
        this.colorStops.push({ color: "#0396FF", length: 100 });
        this.gradientPreview = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        // const gradient = this.gradient();

        // const jss = await this.backgroundStylePlugin.contractToStyleRules(background);
        // this.backgroundPreview({ backgroundPreview: jss });

        this.applyChanges();
    }

    public addColorStop(a, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const colorStopLength = Math.floor(100 * event.offsetX / (<HTMLElement>event.target).clientWidth);

        this.colorStops.push({ color: "#AAAAAA", length: colorStopLength });
        this.applyChanges();
    }

    private async applyChanges(): Promise<void> {
        const abc = getLinearGradientString({ key: "", displayName: "", direction: `${this.direction()}deg`, colorStops: this.colorStops() });

        this.gradientPreview({
            gradientPreview: {
                background: { image: abc }
            }
        });
    }
}