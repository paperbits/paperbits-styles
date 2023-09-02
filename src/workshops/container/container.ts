import * as ko from "knockout";
import template from "./container.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ContainerStylePluginConfig } from "../../plugins/container/containerStylePluginConfig";

@Component({
    selector: "container",
    template: template
})
export class Container {
    public readonly verticalAlignment: ko.Observable<string>;
    public readonly horizontalAlignment: ko.Observable<string>;
    public readonly alignment: ko.Observable<string>;
    public readonly scrollOnOverlow: ko.Observable<boolean>;
    public readonly horizontalAlignmentTooltip: ko.Computed<string>;

    constructor() {
        this.alignment = ko.observable<string>();
        this.verticalAlignment = ko.observable<string>();
        this.horizontalAlignment = ko.observable<string>();
        this.scrollOnOverlow = ko.observable<boolean>();
        this.container = ko.observable<ContainerStylePluginConfig>();
        this.overflowControls = ko.observable(false);

        this.horizontalAlignmentTooltip = ko.computed(() => {
            const value = this.horizontalAlignment();

            switch (value) {
                case "center":
                    return "Center";
                case "around":
                    return "Space around";
                case "between":
                    return "Space between";
                default:
                    return "(Not set)";
            }
        });
    }

    @Param()
    public container: ko.Observable<ContainerStylePluginConfig>;

    @Param()
    public overflowControls: ko.Observable<boolean>;

    @Event()
    public onUpdate: (config: ContainerStylePluginConfig) => void;

    @OnMounted()
    public initialize(): void {
        this.updateObservables();
        this.container.subscribe(this.updateObservables);
        this.scrollOnOverlow.subscribe(this.onOverflowChange);
    }

    private updateObservables(): void {
        const containerStyle = this.container();

        if (containerStyle?.overflow) {
            this.scrollOnOverlow(true);
        }
        else {
            this.scrollOnOverlow(false);
        }

        this.verticalAlignment(containerStyle?.alignment?.vertical);
        this.horizontalAlignment(containerStyle?.alignment?.horizontal);
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private applyChanges(): void {
        this.alignment(`${this.verticalAlignment()} ${this.horizontalAlignment()}`);

        const overflow = this.scrollOnOverlow()
            ? { vertical: "scroll", horizontal: "scroll", autofit: this.container().overflow?.autofit }
            : null;

        this.onUpdate({
            alignment: {
                vertical: this.verticalAlignment(),
                horizontal: this.horizontalAlignment()
            },
            overflow: overflow
        });
    }

    public alignContent(alignment: string): void {
        this.alignment(alignment);
    }

    public toggleHorizontal(): void {
        switch (this.horizontalAlignment()) {
            case "center":
                this.horizontalAlignment("around");
                break;
            case "around":
                this.horizontalAlignment("between");
                break;
            case "between":
                this.horizontalAlignment(undefined);
                break;
            case undefined:
                this.horizontalAlignment("center");
                break;
        }
    }

    public toggleVertical(): void {
        switch (this.verticalAlignment()) {
            case "center":
                this.verticalAlignment("around");
                break;
            case "around":
                this.verticalAlignment("between");
                break;
            case "between":
                this.verticalAlignment(undefined);
                break;
            case undefined:
                this.verticalAlignment("center");
                break;
        }
    }

    public alignLeft(): void {
        this.horizontalAlignment("start");
        this.applyChanges();
    }

    public alignRight(): void {
        this.horizontalAlignment("end");
        this.applyChanges();
    }

    public alignCenter(): void {
        if (this.horizontalAlignment() === "center" || this.horizontalAlignment() === "around" || this.horizontalAlignment() === "between") {
            this.toggleHorizontal();
        }
        else {
            this.horizontalAlignment("center");
        }

        this.applyChanges();
    }

    public alignTop(): void {
        this.verticalAlignment("start");
        this.applyChanges();
    }

    public alignBottom(): void {
        this.verticalAlignment("end");
        this.applyChanges();
    }

    public alignMiddle(): void {
        if (this.verticalAlignment() === "center" || this.verticalAlignment() === "around" || this.verticalAlignment() === "between") {
            this.toggleVertical();
        }
        else {
            this.verticalAlignment("center");
        }

        this.applyChanges();
    }

    public onOverflowChange(): void {
        this.applyChanges();
    }
}
