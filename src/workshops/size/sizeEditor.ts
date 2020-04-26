import * as ko from "knockout";
import template from "./sizeEditor.html";
import * as Objects from "@paperbits/common/objects";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "../../contracts";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "size-editor",
    template: template
})
export class SizeEditor {
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

    private isSizeUpdate: boolean;

    @Param()
    public readonly sizeConfig: ko.Observable<SizeStylePluginConfig>;

    @Param()
    public readonly features: string;

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
    }

    @OnMounted()
    public init(): void {
        const features = this.features.split(",");
        this.heightEnabled(features.includes("height"));
        this.minMaxHeightEnabled(features.includes("minMaxHeight"));
        this.widthEnabled(features.includes("width"));
        this.minMaxWidthEnabled(features.includes("minMaxWidth"));

        this.updateObservables();
        this.sizeConfig.subscribe(this.updateObservables);

        this.itemHeight.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.minHeight.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.maxHeight.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.itemWidth.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.minWidth.extend(ChangeRateLimit).subscribe(this.applyChanges);
        this.maxWidth.extend(ChangeRateLimit).subscribe(this.applyChanges);
    }

    private updateObservables(): void {
        const pluginConfig = this.sizeConfig();

        if (!pluginConfig) {
            return;
        }
      
        this.itemHeight(pluginConfig?.height);
        this.minHeight(pluginConfig?.minHeight);
        this.maxHeight(pluginConfig?.maxHeight);

        this.itemWidth(pluginConfig?.width);
        this.minWidth(pluginConfig?.minWidth);
        this.maxWidth(pluginConfig?.maxWidth);
    }

    private applyChanges(): void {
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
        };

        Objects.cleanupObject(update);
        this.onUpdate(update);
    }
}