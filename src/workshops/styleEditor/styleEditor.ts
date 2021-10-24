import * as ko from "knockout";
import template from "./styleEditor.html";
import { EventManager, Events } from "@paperbits/common/events";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { VariationContract } from "@paperbits/common/styles";
import { BackgroundStylePluginConfig, BoxStylePluginConfig, ShadowStylePluginConfig, SizeStylePluginConfig, TypographyStylePluginConfig } from "../../plugins";
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
    private readonly elementStates: ko.ObservableArray<string>;
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


    constructor(private readonly eventManager: EventManager) {
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
        this.eventManager.addEventListener(Events.ViewportChange, this.updateObservables);
    }

    private scheduleUpdate(): void {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.onUpdate(this.elementStyle), 500);
    }

    public updateObservables(): void {
        this.working(true);

        const style = this.getStyleForSelectedState();
        this.elementStyleTypography(style.typography);
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
        this.elementStyle.displayName = name;
        this.scheduleUpdate();
    }

    public onBackgroundUpdate(pluginConfig: BackgroundStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "background", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onShadowUpdate(pluginConfig: ShadowStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "shadow", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onAnimationUpdate(pluginConfig: AnimationStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "animation", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onBoxUpdate(pluginConfig: BoxStylePluginConfig): void {
        const style = this.getStyleForSelectedState();

        if (pluginConfig.padding) {
            StyleHelper.setPluginConfig(style, "padding", pluginConfig.padding, null);
        }

        if (pluginConfig.margin) {
            StyleHelper.setPluginConfig(style, "margin", pluginConfig.margin, null);
        }

        if (pluginConfig.border) {
            StyleHelper.setPluginConfig(style, "border", pluginConfig.border, null);
        }

        if (pluginConfig.borderRadius) {
            StyleHelper.setPluginConfig(style, "borderRadius", pluginConfig.borderRadius, null);
        }

        if (pluginConfig.typography) {
            StyleHelper.setPluginConfig(style, "typography", pluginConfig.typography, null);
        }

        this.scheduleUpdate();
    }

    public onSizeUpdate(pluginConfig: SizeStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "size", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onTypographyUpdate(pluginConfig: TypographyStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "typography", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onTransformUpdate(pluginConfig: TransformStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "transform", pluginConfig, null);
        this.scheduleUpdate();
    }

    public onTransitionUpdate(pluginConfig: TransitionStylePluginConfig): void {
        const style = this.getStyleForSelectedState();
        StyleHelper.setPluginConfig(style, "transition", pluginConfig, null);
        this.scheduleUpdate();
    }
}