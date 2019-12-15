import * as ko from "knockout";
import template from "./styleEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleContract, LocalStyles, PluginBag } from "@paperbits/common/styles";
import { BoxStylePluginConfig, TypographyStylePluginConfig, BackgroundStylePluginConfig, ShadowStylePluginConfig } from "../../contracts";
import { TransformStylePluginConfig } from "../../plugins/transform";
import { TransitionStylePluginConfig } from "../../plugins/transition";
import { AnimationStylePluginConfig } from "../../plugins/animation";


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
    public readonly elementStyleShadow: ko.Observable<ShadowStylePluginConfig>;
    public readonly elementStyleAnimation: ko.Observable<AnimationStylePluginConfig>;
    public readonly elementStyleBox: ko.Observable<BoxStylePluginConfig>;
    public readonly elementStyleTransform: ko.Observable<TransformStylePluginConfig>;
    public readonly elementStyleTransition: ko.Observable<TransitionStylePluginConfig>;
    public readonly allowBlockStyles: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;


    constructor() {
        this.styleName = ko.observable("New style");
        this.selectedState = ko.observable();
        this.elementStates = ko.observableArray();
        this.elementStyleTypography = ko.observable();
        this.elementStyleTransform = ko.observable();
        this.elementStyleTransition = ko.observable();
        this.elementStyleBackground = ko.observable();
        this.elementStyleShadow = ko.observable();
        this.elementStyleAnimation = ko.observable();
        this.elementStyleBox = ko.observable();
        this.allowBlockStyles = ko.observable();
        this.working = ko.observable(true);
    }

    @Param()
    public elementStyle: StyleContract;

    @Event()
    public onUpdate: (contract: any) => void;

    @OnMounted()
    public initialize(): void {
        this.styleName(this.elementStyle.displayName);
        this.allowBlockStyles(!this.elementStyle.key.startsWith("globals/body"));
        this.resetEditors(this.elementStyle);

        const states = this.elementStyle.allowedStates;
        this.elementStates(states);

        if (states && states.length > 0) {
            this.selectedState.subscribe(this.onStateSelected);
        }

        this.styleName.subscribe(this.onStyleNameUpdate);
    }

    private scheduleUpdate(): void {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.onUpdate(this.elementStyle), 500);
    }

    public resetEditors(style: PluginBag): void {
        this.working(true);
        this.elementStyleTypography(style.typography);
        this.elementStyleTransform(style.transform);
        this.elementStyleTransition(<TransitionStylePluginConfig>style.transition);
        this.elementStyleBackground(style.background);
        this.elementStyleShadow(<ShadowStylePluginConfig>style.shadow);
        this.elementStyleAnimation(<AnimationStylePluginConfig>style.animation);
        this.elementStyleBox(<BoxStylePluginConfig>style);
        this.working(false);
    }

    public onStateSelected(state: string): void {
        this.currentState = state;
        const style = this.getStyleForSelectedState();
        this.resetEditors(style);
    }

    private getStyleForSelectedState(): any {
        let style;

        if (!this.currentState) {
            style = this.elementStyle;
        }
        else if (this.elementStyle.states) {
            if (!this.elementStyle.states[this.currentState]) {
                this.elementStyle.states[this.currentState] = {};
            }

            style = this.elementStyle.states[this.currentState];
        }
        else {
            style = {};
            this.elementStyle.states = {};
            this.elementStyle.states[this.currentState] = style;
        }

        return style;
    }

    public onStyleNameUpdate(name: string): void {
        this.elementStyle["displayName"] = name;
        this.scheduleUpdate();
    }

    public onBackgroundUpdate(background: BackgroundStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        style["background"] = background;
        this.scheduleUpdate();
    }

    public onShadowUpdate(shadow: ShadowStylePluginConfig): void {
        const style = this.getStyleForSelectedState();

        if (shadow) {
            style["shadow"] = { shadowKey: shadow.shadowKey };
        }
        else {
            delete style["shadow"];
        }

        this.scheduleUpdate();
    }

    public onAnimationUpdate(animation: AnimationStylePluginConfig): void {
        const style = this.getStyleForSelectedState();

        if (animation) {
            style["animation"] = {
                animationKey: animation.animationKey,
                duration: animation.duration,
                iterationCount: animation.iterationCount
            };
        }
        else {
            delete style["animation"];
        }

        this.scheduleUpdate();
    }

    public onBoxUpdate(pluginConfig: BoxStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        Object.assign(style, pluginConfig);
        this.scheduleUpdate();
    }

    public onTypographyUpdate(pluginConfig: TypographyStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        style["typography"] = pluginConfig;
        this.scheduleUpdate();
    }

    public onTransformUpdate(pluginConfig: TransformStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        style["transform"] = pluginConfig;
        this.scheduleUpdate();
    }

    public onTransitionUpdate(pluginConfig: TransitionStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        style["transition"] = pluginConfig;
        this.scheduleUpdate();
    }
}