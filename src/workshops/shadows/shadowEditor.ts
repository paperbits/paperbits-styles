import * as ko from "knockout";
import template from "./shadowEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ShadowContract } from "../../contracts";

@Component({
    selector: "shadow-editor",
    template: template,
    injectable: "shadowEditor"
})
export class ShadowEditor {
    private selectTimeout: any;
    public readonly styleName: ko.Observable<string>;
    public readonly colorValue: ko.Observable<any>;
    public readonly blur: ko.Observable<number>;
    public readonly inset: ko.Observable<boolean>;
    public readonly offsetX: ko.Observable<number>;
    public readonly offsetY: ko.Observable<number>;
    public readonly spread: ko.Observable<number>;

    @Param()
    public readonly selectedShadow: ko.Observable<ShadowContract>;

    @Event()
    public readonly onSelect: (shadow: ShadowContract) => void;

    constructor() {
        this.loadStyle = this.loadStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);

        this.styleName = ko.observable();
        this.colorValue = ko.observable();
        this.blur = ko.observable();
        this.inset = ko.observable();
        this.offsetX = ko.observable();
        this.offsetY = ko.observable();
        this.spread = ko.observable();

        this.selectedShadow = ko.observable();
    }

    @OnMounted()
    public async loadStyle(): Promise<void> {
        this.styleName(this.selectedShadow().displayName);
        this.colorValue(this.selectedShadow().color);
        this.blur(+this.selectedShadow().blur);
        this.inset(this.selectedShadow().inset);
        this.offsetX(+this.selectedShadow().offsetX);
        this.offsetY(+this.selectedShadow().offsetY);
        this.spread(+this.selectedShadow().spread);

        this.styleName.subscribe(this.onStyleChange);
        this.colorValue.subscribe(this.onStyleChange);
        this.blur.subscribe(this.onStyleChange);
        this.inset.subscribe(this.onStyleChange);
        this.offsetX.subscribe(this.onStyleChange);
        this.offsetY.subscribe(this.onStyleChange);
        this.spread.subscribe(this.onStyleChange);
    }

    public onStyleChange(): void {
        const shadow = this.selectedShadow();
        shadow.color = this.colorValue();
        shadow.displayName = this.styleName();
        shadow.blur = +this.blur();
        shadow.inset = this.inset();
        shadow.offsetX = +this.offsetX();
        shadow.offsetY = +this.offsetY();
        shadow.spread = +this.spread();

        clearTimeout(this.selectTimeout);
        this.selectTimeout = setTimeout(() => this.scheduleColorUpdate(shadow), 600);
    }

    private scheduleColorUpdate(shadow: ShadowContract): void {
        if (this.selectedShadow) {
            this.selectedShadow(shadow);
        }

        if (this.onSelect) {
            this.onSelect(shadow);
        }
    }
}