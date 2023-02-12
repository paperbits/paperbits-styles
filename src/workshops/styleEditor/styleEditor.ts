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
import { StyleService } from "../../styleService";


@Component({
    selector: "style-editor",
    template: template
})
export class StyleEditor {
    private updateTimeout: any;
    private readonly elementStates: ko.ObservableArray<string>;
    private currentState: string;

    public readonly styleName: ko.Observable<string>;
    public readonly hasStyleName: ko.Observable<boolean>;
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

    public readonly allowTypography: ko.Observable<boolean> = ko.observable(true);
    public readonly allowPadding: ko.Observable<boolean> = ko.observable(true);
    public readonly allowMargin: ko.Observable<boolean> = ko.observable(true);
    public readonly allowBorder: ko.Observable<boolean> = ko.observable(true);
    public readonly allowBackground: ko.Observable<boolean> = ko.observable(true);
    public readonly allowShadow: ko.Observable<boolean> = ko.observable(true);
    public readonly allowAnimation: ko.Observable<boolean> = ko.observable(true);
    public readonly allowTransition: ko.Observable<boolean> = ko.observable(true);
    public readonly allowTransform: ko.Observable<boolean> = ko.observable(true);
    public readonly allowSize: ko.Observable<boolean> = ko.observable(true);
    public readonly allowBox: ko.Observable<boolean> = ko.observable(true);
    public readonly boxFeatures: ko.Observable<string> = ko.observable("padding,margin,border");
    public readonly baseComponentVariations: ko.ObservableArray<VariationContract> = ko.observableArray([]);
    public readonly baseComponentVariationKey: ko.Observable<string> = ko.observable();


    constructor(
        private readonly eventManager: EventManager,
        private readonly styleService: StyleService
    ) {
        this.styleName = ko.observable("New style");
        this.hasStyleName = ko.observable(false);
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
        this.allowBlockStyles = ko.observable();

        this.working = ko.observable(true);
    }

    @Param()
    public elementStyle: VariationContract;

    @Param()
    public baseComponentName: string;

    @Param()
    public plugins: string[];

    @Event()
    public onUpdate: (contract: any) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        if (this.plugins) {
            this.allowTypography(this.plugins.includes("typography"));
            this.allowPadding(this.plugins.includes("padding"));
            this.allowMargin(this.plugins.includes("margin"));
            this.allowBorder(this.plugins.includes("border"));
            this.allowBackground(this.plugins.includes("background"));
            this.allowShadow(this.plugins.includes("shadow"));
            this.allowAnimation(this.plugins.includes("animation"));
            this.allowTransition(this.plugins.includes("transition"));
            this.allowTransform(this.plugins.includes("transform"));
            this.allowSize(this.plugins.includes("size"));

            const boxFeatures = [];

            if (this.allowPadding()) {
                boxFeatures.push("padding");
            }

            if (this.allowMargin()) {
                boxFeatures.push("margin");
            }

            if (this.allowBorder()) {
                boxFeatures.push("border");
            }

            this.boxFeatures(boxFeatures.join(","));
            this.allowBox(boxFeatures.length > 0);
        }

        if (this.baseComponentName) {
            const baseComponentVariations = await this.styleService.getComponentVariations(this.baseComponentName);
            this.baseComponentVariations(baseComponentVariations);

            const baseComponentVariationKey = this.elementStyle["appearance"];
            this.baseComponentVariationKey(baseComponentVariationKey);

            this.baseComponentVariationKey.subscribe(this.onBaseVariationUpdate);
        }

        this.hasStyleName(!!this.elementStyle.displayName);
        this.styleName(this.elementStyle.displayName);

        const isBodyStyle = this.elementStyle.key?.startsWith("globals/body");

        this.allowBlockStyles(!isBodyStyle);
        this.updateObservables();

        const states = this.elementStyle.allowedStates;

        if (states && states.length > 0) {
            this.elementStates(states);
            this.selectedState.subscribe(this.onStateSelected);
        }

        this.styleName.subscribe(this.onStyleNameUpdate);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateObservables);
    }

    private scheduleUpdate(): void {
        if (!this.onUpdate) {
            return;
        }

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.onUpdate(this.elementStyle), 300);
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
        let style: VariationContract;
        let editableStyle = this.elementStyle;

        if (this.baseComponentVariationKey()) {
            editableStyle = this.elementStyle["instance"];
        }

        if (!this.currentState) {
            style = editableStyle;
        }
        else if (editableStyle.states) {
            if (!editableStyle.states[this.currentState]) {
                editableStyle.states[this.currentState] = {};
            }

            style = editableStyle.states[this.currentState];
        }
        else {
            style = <VariationContract>{};
            editableStyle.states = {};
            editableStyle.states[this.currentState] = style;
        }

        return style;
    }

    public onBaseVariationUpdate(baseVariationKey: string): void {
        this.elementStyle["appearance"] = baseVariationKey;
        this.scheduleUpdate();
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