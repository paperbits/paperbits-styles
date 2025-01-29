import * as ko from "knockout";
import template from "./sizeEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "../../plugins";
import { Breakpoints } from "@paperbits/common";
import { StyleHelper } from "../../styleHelper";
import { ViewManager } from "@paperbits/common/ui";
import { Size } from "../../size";

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
    public readonly minWidthInherited: ko.Observable<any>;
    public readonly maxWidthInherited: ko.Observable<any>;
    public readonly minHeightInherited: ko.Observable<any>;
    public readonly maxHeightInherited: ko.Observable<any>;

    public readonly stretchEnabled: ko.Observable<boolean>;
    public readonly stretch: ko.Observable<boolean>;
    public readonly fitEnabled: ko.Observable<boolean>;
    public readonly fit: ko.Observable<boolean>;

    @Param()
    public readonly sizeConfig: ko.Observable<SizeStylePluginConfig | Breakpoints<SizeStylePluginConfig>>;

    @Param()
    public readonly features: string;

    @Param()
    public readonly allowUnits: string;

    @Event()
    public readonly onUpdate: (contract: SizeStylePluginConfig) => void;

    constructor(private readonly viewManager: ViewManager) {
        this.sizeConfig = ko.observable();
        this.features = "height,width,minHeight,maxHeight,minWidth,maxWidth";
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
        this.minWidthInherited = ko.observable();
        this.maxWidthInherited = ko.observable();
        this.minHeightInherited = ko.observable();
        this.maxHeightInherited = ko.observable();

        this.stretchEnabled = ko.observable();
        this.stretch = ko.observable();
        this.fitEnabled = ko.observable();
        this.fit = ko.observable();
    }

    @OnMounted()
    public init(): void {
        const features = this.features.split(",");
        console.log(features);
        this.heightEnabled(features.includes("height"));
        this.minMaxHeightEnabled(features.includes("minHeight"));
        this.widthEnabled(features.includes("width"));
        this.minMaxWidthEnabled(features.includes("minWidth"));
        this.stretchEnabled(features.includes("stretch"));
        this.fitEnabled(features.includes("fit"));

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

        this.fit
            .subscribe(this.applyChanges);
    }

    private updateObservables(): void {
        this.updatesSuspended = true;

        const configInput = this.sizeConfig();

        let pluginConfig: SizeStylePluginConfig;


        if (configInput) {
            if (StyleHelper.isResponsive(configInput)) {
                const viewport = this.viewManager.getViewport();
                pluginConfig = configInput[viewport];

                this.itemHeight(pluginConfig?.height);
                this.minHeight(pluginConfig?.minHeight);
                this.maxHeight(pluginConfig?.maxHeight);
                this.itemWidth(pluginConfig?.width);
                this.minWidth(pluginConfig?.minWidth);
                this.maxWidth(pluginConfig?.maxWidth);
                this.stretch(pluginConfig?.stretch);
                this.fit(pluginConfig?.fit);

                for (const property of this.features.split(",")) {
                    if (!pluginConfig?.[property]) {
                        const closestViewport = <any>StyleHelper.getClosestBreakpoint(<any>configInput, property, viewport);

                        if (closestViewport) {
                            pluginConfig = configInput[closestViewport][property];

                            if (pluginConfig) {
                                const size = Size.parse(<any>pluginConfig);
                                this[property + "Inherited"](size.value);
                            }
                            else {
                                this[property + "Inherited"]("-");
                            }
                        }
                    }
                    else {
                        this[property + "Inherited"]("-");
                    }
                }
            }
            else {
                pluginConfig = <SizeStylePluginConfig>this.sizeConfig();

                this.itemHeight(pluginConfig?.height);
                this.minHeight(pluginConfig?.minHeight);
                this.maxHeight(pluginConfig?.maxHeight);
                this.itemWidth(pluginConfig?.width);
                this.minWidth(pluginConfig?.minWidth);
                this.maxWidth(pluginConfig?.maxWidth);
                this.stretch(pluginConfig?.stretch);
                this.fit(pluginConfig?.fit);
            }
        }

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
            stretch: this.stretch(),
            fit: this.fit()
        };

        this.onUpdate(update);
    }
}