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

        this.loadData(this.sizeConfig() || {});

        this.sizeConfig.extend(ChangeRateLimit).subscribe(this.updateSize);

        this.itemHeight.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);
        this.minHeight.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);
        this.maxHeight.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);

        this.itemWidth.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);
        this.minWidth.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);
        this.maxWidth.extend(ChangeRateLimit).subscribe(this.dispatchUpdates);
    }
    
    private loadData(data: SizeStylePluginConfig): void {
        const currentStyle = data;
        currentStyle.height && this.itemHeight(currentStyle.height);
        currentStyle.minHeight && this.minHeight(currentStyle.minHeight);
        currentStyle.maxHeight && this.maxHeight(currentStyle.maxHeight);

        currentStyle.width && this.itemWidth(currentStyle.width);
        currentStyle.minWidth && this.minWidth(currentStyle.minWidth);
        currentStyle.maxWidth && this.maxWidth(currentStyle.maxWidth);
    }

    private updateSize(update: SizeStylePluginConfig): void {
        this.isSizeUpdate = true;
        this.loadData(update);
        this.isSizeUpdate = false;
    }

    private dispatchUpdates(): void {
        if (!this.onUpdate || this.isSizeUpdate) {
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