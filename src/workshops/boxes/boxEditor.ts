import * as ko from "knockout";
import template from "./boxEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BoxContract } from "../../contracts";


@Component({
    selector: "box-editor",
    template: template,
    injectable: "boxEditor"
})
export class BoxEditor {
    public marginTop: KnockoutObservable<any>;
    public marginLeft: KnockoutObservable<any>;
    public marginRight: KnockoutObservable<any>;
    public marginBottom: KnockoutObservable<any>;

    public borderTop: KnockoutObservable<any>;
    public borderLeft: KnockoutObservable<any>;
    public borderRight: KnockoutObservable<any>;
    public borderBottom: KnockoutObservable<any>;

    public paddingTop: KnockoutObservable<any>;
    public paddingLeft: KnockoutObservable<any>;
    public paddingRight: KnockoutObservable<any>;
    public paddingBottom: KnockoutObservable<any>;

    public topLeftRadius: KnockoutObservable<any>;
    public topRightRadius: KnockoutObservable<any>;
    public bottomLeftRadius: KnockoutObservable<any>;
    public bottomRightRadius: KnockoutObservable<any>;

    @Param()
    public elementStyle: KnockoutObservable<BoxContract>;

    @Event()
    public onUpdate: (contract: BoxContract) => void;

    constructor() {
        this.init = this.init.bind(this);
        this.dispatchUpdates = this.dispatchUpdates.bind(this);

        this.elementStyle = ko.observable();

        this.marginTop = ko.observable();
        this.marginLeft = ko.observable();
        this.marginRight = ko.observable();
        this.marginBottom = ko.observable();

        this.borderTop = ko.observable();
        this.borderLeft = ko.observable();
        this.borderRight = ko.observable();
        this.borderBottom = ko.observable();

        this.paddingTop = ko.observable();
        this.paddingLeft = ko.observable();
        this.paddingRight = ko.observable();
        this.paddingBottom = ko.observable();

        this.topLeftRadius = ko.observable();
        this.topRightRadius = ko.observable();
        this.bottomLeftRadius = ko.observable();
        this.bottomRightRadius = ko.observable();
    }

    @OnMounted()
    public init(): void {
        const currentStyle = this.elementStyle();

        if (currentStyle.margin) {
            this.marginTop(currentStyle.margin.top);
            this.marginLeft(currentStyle.margin.left);
            this.marginRight(currentStyle.margin.right);
            this.marginBottom(currentStyle.margin.bottom);
        }

        if (currentStyle.border) {
            this.borderTop(currentStyle.border.top.width);
            this.borderLeft(currentStyle.border.left.width);
            this.borderRight(currentStyle.border.right.width);
            this.borderBottom(currentStyle.border.bottom.width);
        }

        if (currentStyle.borderRadius) {
            this.topLeftRadius(currentStyle.borderRadius.topLeftRadius);
            this.topRightRadius(currentStyle.borderRadius.topRightRadius);
            this.bottomLeftRadius(currentStyle.borderRadius.bottomLeftRadius);
            this.bottomRightRadius(currentStyle.borderRadius.bottomLeftRadius);
        }

        if (currentStyle.padding) {
            this.paddingTop(currentStyle.padding.top);
            this.paddingLeft(currentStyle.padding.left);
            this.paddingRight(currentStyle.padding.right);
            this.paddingBottom(currentStyle.padding.bottom);
        }

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


    private dispatchUpdates(): void {
        if (!this.onUpdate) {
            return;
        }

        this.onUpdate({
            padding: {
                top: parseInt(this.paddingTop()),
                left: parseInt(this.paddingLeft()),
                right: parseInt(this.paddingRight()),
                bottom: parseInt(this.paddingBottom())
            },
            margin: {
                top: parseInt(this.marginTop()),
                left: parseInt(this.marginLeft()),
                right: parseInt(this.marginRight()),
                bottom: parseInt(this.marginBottom())
            },
            border: {
                top: { width: parseInt(this.borderTop()), style: "solid", color: "orange" },
                left: { width: parseInt(this.borderLeft()), style: "solid", color: "orange" },
                right: { width: parseInt(this.borderRight()), style: "solid", color: "orange" },
                bottom: { width: parseInt(this.borderBottom()), style: "solid", color: "orange" }
            },
            borderRadius: {
                topLeftRadius: parseInt(this.topLeftRadius()),
                topRightRadius: parseInt(this.topRightRadius()),
                bottomLeftRadius: parseInt(this.bottomLeftRadius()),
                bottomRightRadius: parseInt(this.bottomRightRadius())
            }
        });
    }
}