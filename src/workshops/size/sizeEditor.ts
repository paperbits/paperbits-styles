import * as ko from "knockout";
import template from "./sizeEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "../../plugins";

@Component({
    selector: "size-editor",
    template: template
})
export class SizeEditor {
    private updatesSuspended: boolean;

    public readonly heightEnabled: ko.Observable<boolean>;
    public readonly itemHeight: ko.Observable<string | number>;

    public readonly widthEnabled: ko.Observable<boolean>;
    public readonly itemWidth: ko.Observable<string | number>;

    public readonly minMaxHeightEnabled: ko.Observable<boolean>;
    public readonly minHeight: ko.Observable<string | number>;
    public readonly maxHeight: ko.Observable<string | number>;

    public readonly minMaxWidthEnabled: ko.Observable<boolean>;
    public readonly minWidth: ko.Observable<string | number>;
    public readonly maxWidth: ko.Observable<string | number>;

    public readonly stretchEnabled: ko.Observable<boolean>;
    public readonly stretch: ko.Observable<boolean>;

    @Param()
    public readonly sizeConfig: ko.Observable<SizeStylePluginConfig>;

    @Param()
    public readonly features: string;

    @Param()
    public readonly allowUnits: string;

    @Event()
    public readonly onUpdate: (contract: SizeStylePluginConfig) => void;

    constructor() {
        this.sizeConfig = ko.observable();
        this.features = "height,minMaxHeight,width,minMaxWidth";
        this.heightEnabled = ko.observable();
        this.itemHeight = ko.observable();
        this.widthEnabled = ko.observable();
        this.itemWidth = ko.observable();
        this.minMaxHeightEnabled = ko.observable();
        this.minHeight = ko.observable();
        this.maxHeight = ko.observable();
        this.minMaxWidthEnabled = ko.observable();
        this.minWidth = ko.observable();
        this.maxWidth = ko.observable();

        this.stretchEnabled = ko.observable();
        this.stretch = ko.observable();
    }

    @OnMounted()
    public init(): void {
        const features = this.features.split(",");
        this.heightEnabled(features.includes("height"));
        this.minMaxHeightEnabled(features.includes("minMaxHeight"));
        this.widthEnabled(features.includes("width"));
        this.minMaxWidthEnabled(features.includes("minMaxWidth"));
        this.stretchEnabled(features.includes("stretch"));

        this.updateObservables();

        this.sizeConfig
            .subscribe(this.updateObservables);

        this.itemHeight
            .subscribe(this.applyChanges);

        this.minHeight
            .subscribe(this.applyChanges);

        this.maxHeight
            .subscribe(this.applyChanges);

        this.itemWidth
            .subscribe(this.applyChanges);

        this.minWidth
            .subscribe(this.applyChanges);

        this.maxWidth
            .subscribe(this.applyChanges);

        this.stretch
            .subscribe(this.applyChanges);
    }

    private updateObservables(): void {
        this.updatesSuspended = true;

        const pluginConfig = this.sizeConfig();
        this.itemHeight(pluginConfig?.height);
        this.minHeight(pluginConfig?.minHeight);
        this.maxHeight(pluginConfig?.maxHeight);
        this.itemWidth(pluginConfig?.width);
        this.minWidth(pluginConfig?.minWidth);
        this.maxWidth(pluginConfig?.maxWidth);
        this.stretch(pluginConfig?.stretch);

        this.updatesSuspended = false;
    }

    private applyChanges(): void {
        if (this.updatesSuspended) {
            return;
        }

        if (!this.onUpdate) {
            return;
        }

        const update = {
            height: this.itemHeight(),
            minHeight: this.minHeight(),
            maxHeight: this.maxHeight(),
            width: this.itemWidth(),
            minWidth: this.minWidth(),
            maxWidth: this.maxWidth(),
            stretch: this.stretch()
        };

        this.onUpdate(update);
    }
}