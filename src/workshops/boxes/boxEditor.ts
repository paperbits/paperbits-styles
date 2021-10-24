import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import template from "./boxEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BoxStylePluginConfig } from "../../plugins";
import { BorderStyle } from "../../plugins/border/borderStyle";


@Component({
    selector: "box",
    template: template
})
export class BoxEditor {
    public readonly marginEnabled: ko.Observable<boolean>;
    public readonly marginTop: ko.Observable<any>;
    public readonly marginLeft: ko.Observable<any>;
    public readonly marginRight: ko.Observable<any>;
    public readonly marginBottom: ko.Observable<any>;

    public readonly borderEnabled: ko.Observable<boolean>;
    public readonly borderTop: ko.Observable<BorderStyle>;
    public readonly borderLeft: ko.Observable<BorderStyle>;
    public readonly borderRight: ko.Observable<any>;
    public readonly borderBottom: ko.Observable<any>;

    public readonly paddingEnabled: ko.Observable<boolean>;
    public readonly paddingTop: ko.Observable<any>;
    public readonly paddingLeft: ko.Observable<any>;
    public readonly paddingRight: ko.Observable<any>;
    public readonly paddingBottom: ko.Observable<any>;

    public readonly topLeftRadius: ko.Observable<any>;
    public readonly topRightRadius: ko.Observable<any>;
    public readonly bottomLeftRadius: ko.Observable<any>;
    public readonly bottomRightRadius: ko.Observable<any>;

    public readonly borderTopWidth: ko.Computed<any>;
    public readonly borderLeftWidth: ko.Computed<any>;
    public readonly borderRightWidth: ko.Computed<any>;
    public readonly borderBottomWidth: ko.Computed<any>;

    private isBoxUpdate: boolean;
    private currentState: BoxStylePluginConfig;

    @Param()
    public readonly box: ko.Observable<BoxStylePluginConfig>;

    @Param()
    public readonly features: string;

    @Event()
    public readonly onUpdate: (contract: BoxStylePluginConfig, changeset?: BoxStylePluginConfig) => void;

    constructor() {
        this.box = ko.observable();
        this.features = "margin,padding,border";
        // this.features = "padding,border";

        this.marginEnabled = ko.observable();
        this.marginTop = ko.observable();
        this.marginLeft = ko.observable();
        this.marginRight = ko.observable();
        this.marginBottom = ko.observable();

        this.borderEnabled = ko.observable();
        this.borderTop = ko.observable();
        this.borderLeft = ko.observable();
        this.borderRight = ko.observable();
        this.borderBottom = ko.observable();

        this.paddingEnabled = ko.observable();
        this.paddingTop = ko.observable();
        this.paddingLeft = ko.observable();
        this.paddingRight = ko.observable();
        this.paddingBottom = ko.observable();

        this.topLeftRadius = ko.observable();
        this.topRightRadius = ko.observable();
        this.bottomLeftRadius = ko.observable();
        this.bottomRightRadius = ko.observable();

        this.borderTopWidth = ko.computed(() => this.borderTop() ? this.borderTop().width : null);
        this.borderLeftWidth = ko.computed(() => this.borderLeft() ? this.borderLeft().width : null);
        this.borderRightWidth = ko.computed(() => this.borderRight() ? this.borderRight().width : null);
        this.borderBottomWidth = ko.computed(() => this.borderBottom() ? this.borderBottom().width : null);
    }

    @OnMounted()
    public init(): void {
        const features = this.features.split(",");
        this.marginEnabled(features.includes("margin"));
        this.paddingEnabled(features.includes("padding"));
        this.borderEnabled(features.includes("border"));

        this.loadData(this.box());

        this.box.subscribe(this.updateBox);

        this.marginTop.subscribe(this.dispatchUpdates);
        this.marginLeft.subscribe(this.dispatchUpdates);
        this.marginRight.subscribe(this.dispatchUpdates);
        this.marginBottom.subscribe(this.dispatchUpdates);

        this.borderTop.subscribe(this.dispatchUpdates);
        this.borderLeft.subscribe(this.dispatchUpdates);
        this.borderRight.subscribe(this.dispatchUpdates);
        this.borderBottom.subscribe(this.dispatchUpdates);

        this.topLeftRadius.subscribe(this.dispatchUpdates);
        this.topRightRadius.subscribe(this.dispatchUpdates);
        this.bottomLeftRadius.subscribe(this.dispatchUpdates);
        this.bottomRightRadius.subscribe(this.dispatchUpdates);

        this.paddingTop.subscribe(this.dispatchUpdates);
        this.paddingLeft.subscribe(this.dispatchUpdates);
        this.paddingRight.subscribe(this.dispatchUpdates);
        this.paddingBottom.subscribe(this.dispatchUpdates);
    }

    private loadData(data: BoxStylePluginConfig): void {
        if (!data) {
            return;
        }

        const currentStyle = data;

        if (currentStyle.margin) {
            this.marginTop(currentStyle.margin.top);
            this.marginLeft(currentStyle.margin.left);
            this.marginRight(currentStyle.margin.right);
            this.marginBottom(currentStyle.margin.bottom);
        }

        if (currentStyle.border) {
            this.borderTop(currentStyle.border.top);
            this.borderLeft(currentStyle.border.left);
            this.borderRight(currentStyle.border.right);
            this.borderBottom(currentStyle.border.bottom);
        }

        if (currentStyle.borderRadius) {
            this.topLeftRadius(currentStyle.borderRadius.topLeftRadius);
            this.topRightRadius(currentStyle.borderRadius.topRightRadius);
            this.bottomLeftRadius(currentStyle.borderRadius.bottomLeftRadius);
            this.bottomRightRadius(currentStyle.borderRadius.bottomRightRadius);
        }

        if (currentStyle.padding) {
            this.paddingTop(currentStyle.padding.top);
            this.paddingLeft(currentStyle.padding.left);
            this.paddingRight(currentStyle.padding.right);
            this.paddingBottom(currentStyle.padding.bottom);
        }

        this.currentState = this.getState();
    }

    private updateBox(update: BoxStylePluginConfig): void {
        this.isBoxUpdate = true;
        this.loadData(update);
        this.isBoxUpdate = false;
    }

    private parseNumber(value: any): any {
        if (value === "auto") {
            return value;
        }

        if (value === 0) {
            return 0;
        }

        if (value) {
            const parsed = parseInt(value);
            if (parsed === 0) {
                return 0;
            }
            return parsed || undefined;
        }
        else {
            return undefined;
        }
    }

    private dispatchUpdates(): void {
        if (!this.onUpdate || this.isBoxUpdate) {
            return;
        }

        const newState: BoxStylePluginConfig = this.getState();
        const changeSet = Objects.generateChangeset(this.currentState, newState);

        this.onUpdate(newState, changeSet);

        this.currentState = newState;
    }

    private getState(): BoxStylePluginConfig {
        const state = {
            padding: {
                top: this.parseNumber(this.paddingTop()),
                left: this.parseNumber(this.paddingLeft()),
                right: this.parseNumber(this.paddingRight()),
                bottom: this.parseNumber(this.paddingBottom())
            },
            margin: {
                top: this.parseNumber(this.marginTop()),
                left: this.parseNumber(this.marginLeft()),
                right: this.parseNumber(this.marginRight()),
                bottom: this.parseNumber(this.marginBottom())
            },
            border: {
                top: this.borderTop(),
                left: this.borderLeft(),
                right: this.borderRight(),
                bottom: this.borderBottom()
            },
            borderRadius: {
                topLeftRadius: this.parseNumber(this.topLeftRadius()),
                topRightRadius: this.parseNumber(this.topRightRadius()),
                bottomLeftRadius: this.parseNumber(this.bottomLeftRadius()),
                bottomRightRadius: this.parseNumber(this.bottomRightRadius())
            }
        };

        Objects.cleanupObject(state);

        return state;
    }
}