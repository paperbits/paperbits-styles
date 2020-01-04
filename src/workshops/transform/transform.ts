import * as ko from "knockout";
import template from "./transform.html";
import { StyleService } from "../../styleService";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { TransformStylePluginConfig } from "../../plugins/transform";


@Component({
    selector: "transform",
    template: template
})
export class Transform {
    public readonly translateX: ko.Observable<string | number>;
    public readonly translateY: ko.Observable<string | number>;
    public readonly scaleX: ko.Observable<string | number>;
    public readonly scaleY: ko.Observable<string | number>;
    public readonly rotate: ko.Observable<string | number>;

    @Param()
    public transform: ko.Observable<TransformStylePluginConfig>;

    @Event()
    public onUpdate: (contract: TransformStylePluginConfig) => void;

    constructor(private readonly styleService: StyleService) {
        this.transform = ko.observable();
        this.translateX = ko.observable();
        this.translateY = ko.observable();
        this.scaleX = ko.observable();
        this.scaleY = ko.observable();
        this.rotate = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const config = this.transform();

        if (config) {
            if (config.translate) {
                this.translateX(config.translate.x);
                this.translateY(config.translate.y);
            }

            if (config.scale) {
                this.scaleX(config.scale.x);
                this.scaleY(config.scale.y);
            }

            if (config.rotate) {
                this.rotate(config.rotate);
            }
        }

        this.translateX.subscribe(this.applyChanges);
        this.translateY.subscribe(this.applyChanges);
        this.scaleX.subscribe(this.applyChanges);
        this.scaleY.subscribe(this.applyChanges);
        this.rotate.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        if (!this.onUpdate) {
            return;
        }

        this.onUpdate({
            translate: {
                x: this.translateX(),
                y: this.translateY()
            },
            scale: {
                x: this.scaleX(),
                y: this.scaleY()
            },
            rotate: this.rotate()
        });
    }
}