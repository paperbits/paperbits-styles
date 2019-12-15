import * as ko from "knockout";
import template from "./container.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ContainerStylePluginConfig } from "../../contracts/containerContract";

@Component({
    selector: "container",
    template: template,
    injectable: "container"
})
export class Container {
    public readonly verticalAlignment: ko.Observable<string>;
    public readonly horizontalAlignment: ko.Observable<string>;
    public readonly alignment: ko.Observable<string>;
    public readonly scrollOnOverlow: ko.Observable<boolean>;

    constructor() {
        this.alignment = ko.observable<string>();
        this.verticalAlignment = ko.observable<string>();
        this.horizontalAlignment = ko.observable<string>();
        this.scrollOnOverlow = ko.observable<boolean>();
        this.config = ko.observable<ContainerStylePluginConfig>();
    }

    @Param()
    public config: ko.Observable<ContainerStylePluginConfig>;

    @Event()
    public onUpdate: (config: ContainerStylePluginConfig) => void;

    @OnMounted()
    public initialize(): void {
        this.updateObservables(this.config());
        this.config.subscribe(this.updateObservables);
        this.scrollOnOverlow.subscribe(this.onOverflowChange);
    }

    private updateObservables(stylePluginConfig: ContainerStylePluginConfig): void {
        if (!stylePluginConfig) {
            return;
        }

        const overflowStyle = stylePluginConfig.overflow;

        if (overflowStyle) {
            this.scrollOnOverlow(true);
        }
        else {
            this.scrollOnOverlow(false);
        }

        const alignmentStyle = stylePluginConfig.alignment;

        if (alignmentStyle) {
            this.verticalAlignment(alignmentStyle.vertical);
            this.horizontalAlignment(alignmentStyle.horizontal);
        }
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private applyChanges(): void {
        this.alignment(`${this.verticalAlignment()} ${this.horizontalAlignment()}`);

        const overflow = this.scrollOnOverlow()
            ? { vertical: "scroll", horizontal: "scroll" }
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
