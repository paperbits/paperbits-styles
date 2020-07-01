import * as ko from "knockout";
import template from "./styleEditor.html";
import { EventManager } from "@paperbits/common/events";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { PluginBag, VariationContract } from "@paperbits/common/styles";
import { ViewManager } from "@paperbits/common/ui";
import { BackgroundStylePluginConfig, BoxStylePluginConfig, ShadowStylePluginConfig, SizeStylePluginConfig, TypographyStylePluginConfig } from "../../contracts";
import { AnimationStylePluginConfig } from "../../plugins/animation";
import { TransformStylePluginConfig } from "../../plugins/transform";
import { TransitionStylePluginConfig } from "../../plugins/transition";
import { StyleHelper } from "../../styleHelper";


@Component({
    selector: "style-editor",
    template: template
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
    public readonly elementStyleSize: ko.Observable<SizeStylePluginConfig>;
    public readonly elementStyleTransform: ko.Observable<TransformStylePluginConfig>;
    public readonly elementStyleTransition: ko.Observable<TransitionStylePluginConfig>;
    public readonly allowBlockStyles: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;


    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager
    ) {
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
        this.elementStyleSize = ko.observable();
        this.allowBlockStyles = ko.observable();
        this.working = ko.observable(true);
    }

    @Param()
    public elementStyle: VariationContract;

    @Event()
    public onUpdate: (contract: any) => void;

    @OnMounted()
    public initialize(): void {
        this.styleName(this.elementStyle.displayName);
        this.allowBlockStyles(!this.elementStyle.key.startsWith("globals/body"));
        this.updateObservables();

        const states = this.elementStyle.allowedStates;
        this.elementStates(states);

        if (states && states.length > 0) {
            this.selectedState.subscribe(this.onStateSelected);
        }

        this.styleName.subscribe(this.onStyleNameUpdate);
        this.eventManager.addEventListener("onViewportChange", this.updateObservables);
    }

    private scheduleUpdate(): void {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.onUpdate(this.elementStyle), 500);
    }

    public updateObservables(): void {
        this.working(true);

        const style = this.getStyleForSelectedState();
        const viewport = this.viewManager.getViewport();

        const typographyConfig = StyleHelper.getPluginConfig(style, "typography", viewport);
        this.elementStyleTypography(typographyConfig);


        this.elementStyleTransform(style.transform);
        this.elementStyleTransition(<TransitionStylePluginConfig>style.transition);
        this.elementStyleBackground(style.background);
        this.elementStyleShadow(<ShadowStylePluginConfig>style.shadow);
        this.elementStyleAnimation(<AnimationStylePluginConfig>style.animation);
        this.elementStyleBox(<BoxStylePluginConfig>style);
        this.elementStyleSize(<SizeStylePluginConfig>style.size);
        this.working(false);
    }

    public onStateSelected(state: string): void {
        this.currentState = state;
        this.updateObservables();
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

    public onSizeUpdate(pluginConfig: SizeStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        style["size"] = pluginConfig;
        this.scheduleUpdate();
    }

    public onTypographyUpdate(pluginConfig: TypographyStylePluginConfig): void {
        const viewport = this.viewManager.getViewport();
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "typography", pluginConfig, viewport);
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