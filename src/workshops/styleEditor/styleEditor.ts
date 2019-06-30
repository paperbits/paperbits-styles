import * as ko from "knockout";
import template from "./styleEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BoxContract, ColorContract, AnimationContract, ShadowContract, TypographyStylePluginConfig, BackgroundStylePluginConfig } from "../../contracts";


@Component({
    selector: "style-editor",
    template: template,
    injectable: "styleEditor"
})
export class StyleEditor {
    private updateTimeout: any;
    private elementStates: ko.ObservableArray<string>;
    private currentState: string;

    public readonly styleName: ko.Observable<string>;
    public readonly selectedState: ko.Observable<string>;
    public readonly elementStyleTypography: ko.Observable<TypographyStylePluginConfig>;
    public readonly elementStyleBackground: ko.Observable<BackgroundStylePluginConfig>;
    public readonly elementStyleShadow: ko.Observable<any>;
    public readonly elementStyleAnimation: ko.Observable<any>;
    public readonly elementStyleBox: ko.Observable<BoxContract>;
    public allowBlockStyles: ko.Observable<boolean>;


    constructor() {
        this.styleName = ko.observable("New style");
        this.selectedState = ko.observable();
        this.elementStates = ko.observableArray();
        this.elementStyleTypography = ko.observable();
        this.elementStyleBackground = ko.observable();
        this.elementStyleShadow = ko.observable();
        this.elementStyleAnimation = ko.observable();
        this.elementStyleBox = ko.observable();
        this.allowBlockStyles = ko.observable();
    }

    @Param()
    public elementStyle: any; // ko.Observable<any>;

    @Event()
    public onUpdate: (contract: any) => void;

    @OnMounted()
    public initialize(): void {
        this.styleName(this.elementStyle["displayName"]);
        this.elementStyleTypography(this.elementStyle.typography);
        this.elementStyleBackground(this.elementStyle.background);
        this.elementStyleShadow(this.elementStyle.shadow);
        this.elementStyleAnimation(this.elementStyle.animation);
        this.elementStyleBox(this.elementStyle);
        this.allowBlockStyles(!this.elementStyle.key.startsWith("globals/body"));

        const states: [] = this.elementStyle["allowedStates"];
        this.elementStates(states);

        if (states && states.length > 0) {
            this.selectedState.subscribe(this.onStateUpdate);
        }

        this.styleName.subscribe(this.onStyleNameUpdate);
    }

    private scheduleUpdate(): void {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.onUpdate(this.elementStyle), 500);
    }

    public onStateUpdate(newState: string): void {
        const stateContract = this.elementStyle["states"] || {};

        if (newState && this.currentState !== newState) {
            const newStateContract = stateContract[newState] || {};
            this.elementStyleTypography(newStateContract.typography);
            this.elementStyleBackground(newStateContract.background);
            this.elementStyleShadow(newStateContract.shadow);
            this.elementStyleAnimation(newStateContract.animation);
            this.elementStyleBox(newStateContract);
        }
        else {
            if (!newState) {
                this.elementStyleTypography(this.elementStyle.typography);
                this.elementStyleBackground(this.elementStyle.background);
                this.elementStyleShadow(this.elementStyle.shadow);
                this.elementStyleAnimation(this.elementStyle.animation);
                this.elementStyleBox(this.elementStyle);
            }
        }
        this.currentState = newState;
    }

    private getUpdateElement(): any {
        if (this.currentState) {
            this.elementStyle.states = this.elementStyle.states || {};
            this.elementStyle.states[this.currentState] = this.elementStyle.states[this.currentState] || {};
            return this.elementStyle.states[this.currentState];
        }
        return this.elementStyle;
    }

    public onStyleNameUpdate(name: string): void {
        this.elementStyle["displayName"] = name;
        this.scheduleUpdate();
    }

    public onBackgroundUpdate(background: BackgroundStylePluginConfig): void {
        const updateElement = this.getUpdateElement();
        updateElement["background"] = background;
        this.scheduleUpdate();
    }

    public onShadowUpdate(shadow: any): void {
        const updateElement = this.getUpdateElement();

        if (shadow) {
            updateElement["shadow"] = { shadowKey: shadow.shadowKey };
        }
        else {
            delete updateElement["shadow"];
        }

        this.scheduleUpdate();
    }

    public onAnimationUpdate(animation: any): void {
        const updateElement = this.getUpdateElement();

        if (animation) {
            updateElement["animation"] = {
                animationKey: animation.animationKey,
                duration: animation.duration,
                iterationCount: animation.iterationCount
            };
        }
        else {
            delete updateElement["animation"];
        }

        this.scheduleUpdate();
    }

    public onBoxUpdate(boxContract: BoxContract): void {
        const updateElement = this.getUpdateElement();
        Object.assign(updateElement, boxContract);
        this.scheduleUpdate();
    }

    public onTypographyUpdate(typographyContract: TypographyStylePluginConfig): void {
        const updateElement = this.getUpdateElement();
        updateElement["typography"] = typographyContract;
        this.scheduleUpdate();
    }
}