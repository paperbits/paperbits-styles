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
    public marginTop: ko.Observable<any>;
    public marginLeft: ko.Observable<any>;
    public marginRight: ko.Observable<any>;
    public marginBottom: ko.Observable<any>;

    public borderTop: ko.Observable<any>;
    public borderLeft: ko.Observable<any>;
    public borderRight: ko.Observable<any>;
    public borderBottom: ko.Observable<any>;

    public paddingTop: ko.Observable<any>;
    public paddingLeft: ko.Observable<any>;
    public paddingRight: ko.Observable<any>;
    public paddingBottom: ko.Observable<any>;

    public topLeftRadius: ko.Observable<any>;
    public topRightRadius: ko.Observable<any>;
    public bottomLeftRadius: ko.Observable<any>;
    public bottomRightRadius: ko.Observable<any>;

    @Param()
    public elementStyle: ko.Observable<BoxContract>;

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

        const parseNumber = (value) => {
            if (value) {
                return parseInt(value);
            }
            else {
                return undefined;
            }
        };

        this.onUpdate({
            padding: {
                top: parseNumber(this.paddingTop()),
                left: parseNumber(this.paddingLeft()),
                right: parseNumber(this.paddingRight()),
                bottom: parseNumber(this.paddingBottom())
            },
            margin: {
                top: parseNumber(this.marginTop()),
                left: parseNumber(this.marginLeft()),
                right: parseNumber(this.marginRight()),
                bottom: parseNumber(this.marginBottom())
            },
            border: {
                top: { width: parseNumber(this.borderTop()), style: "solid", color: "orange" },
                left: { width: parseNumber(this.borderLeft()), style: "solid", color: "orange" },
                right: { width: parseNumber(this.borderRight()), style: "solid", color: "orange" },
                bottom: { width: parseNumber(this.borderBottom()), style: "solid", color: "orange" }
            },
            borderRadius: {
                topLeftRadius: parseNumber(this.topLeftRadius()),
                topRightRadius: parseNumber(this.topRightRadius()),
                bottomLeftRadius: parseNumber(this.bottomLeftRadius()),
                bottomRightRadius: parseNumber(this.bottomRightRadius())
            }
        });
    }
}