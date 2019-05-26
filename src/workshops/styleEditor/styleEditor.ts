import * as ko from "knockout";
import template from "./styleEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BoxContract, ColorContract, AnimationContract, ShadowContract, TypographyContract, BackgroundContract } from "../../contracts";


@Component({
    selector: "style-editor",
    template: template,
    injectable: "styleEditor"
})
export class StyleEditor {
    private elementStates: ko.ObservableArray<string>;
    private currentState: string;

    @Param()
    public elementStyle: any; // ko.Observable<any>;

    @Param()
    public styleKey: ko.Observable<string>;

    @Event()
    public onUpdate: (contract: any) => void;

    public styleName: ko.Observable<string>;
    public selectedState: ko.Observable<string>;

    public elementStyleTypography: ko.Observable<TypographyContract>;
    public elementStyleBackground: ko.Observable<BackgroundContract>;
    public elementStyleShadow: ko.Observable<any>;
    public elementStyleAnimation: ko.Observable<any>;
    public elementStyleBox: ko.Observable<BoxContract>;

    public readonly backgroundHasPicture: ko.Computed<boolean>;

    constructor() {
        this.styleName = ko.observable("New style");
        this.selectedState = ko.observable();
        this.elementStates = ko.observableArray();

        this.elementStyleTypography = ko.observable();
        this.elementStyleBackground = ko.observable();
        this.elementStyleShadow = ko.observable();
        this.elementStyleAnimation = ko.observable();
        this.elementStyleBox = ko.observable();
    }

    @OnMounted()
    public initialize(): void {
        this.styleName(this.elementStyle["displayName"]);

        this.elementStyleTypography(this.elementStyle.typography);
        this.elementStyleBackground(this.elementStyle.background);
        this.elementStyleShadow(this.elementStyle.shadow);
        this.elementStyleAnimation(this.elementStyle.animation);
        this.elementStyleBox(this.elementStyle);

        const states: [] = this.elementStyle["allowedStates"];
        this.elementStates(states);
        
        if (states && states.length > 0) {
            this.selectedState.subscribe(this.onStateUpdate);
        }

        this.styleName.subscribe(this.onStyleNameUpdate);
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
        } else {
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
        this.onUpdate(this.elementStyle);
    }

    public onBackgroundUpdate(background: BackgroundContract): void {
        const updateElement = this.getUpdateElement();
        updateElement["background"] = background;
        this.onUpdate(this.elementStyle);
    }

    public onShadowUpdate(shadow): void {
        const updateElement = this.getUpdateElement();
        if (shadow) {
            updateElement["shadow"] = { shadowKey: shadow.shadowKey };
        }
        else {
            delete updateElement["shadow"];
        }

        this.onUpdate(this.elementStyle);
    }

    public onAnimationUpdate(animation): void {
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

        this.onUpdate(this.elementStyle);
    }

    public onBoxUpdate(boxContract: BoxContract): void {
        const updateElement = this.getUpdateElement();
        Object.assign(updateElement, boxContract);
        this.onUpdate(this.elementStyle);
    }

    public onTypographyUpdate(typographyContract: TypographyContract): void {
        const updateElement = this.getUpdateElement();
        updateElement["typography"] = typographyContract;
        this.onUpdate(this.elementStyle);
    }
}