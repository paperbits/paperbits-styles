import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./animationEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { AnimationContract } from "../../contracts";
import { AnimationStylePluginConfig } from "../../plugins/animation";

const inheritLabel = "(Inherit)";

@Component({
    selector: "animation",
    template: template
})
export class AnimationEditor {
    public readonly animationKey: ko.Observable<string>;
    public readonly displayName: ko.Observable<string>;
    public readonly iterationCount: ko.Observable<string | number>;
    public readonly duration: ko.Observable<string | number>;
    public readonly startWhenVisible: ko.Observable<boolean>;

    @Param()
    public readonly animation: ko.Observable<AnimationStylePluginConfig>;

    @Event()
    public readonly onUpdate: (animation: AnimationStylePluginConfig) => void;

    constructor(private readonly styleService: StyleService) {
        this.applyChanges = this.applyChanges.bind(this);
        this.loadAnimations = this.loadAnimations.bind(this);
        this.onAnimationSelected = this.onAnimationSelected.bind(this);

        this.animationKey = ko.observable();
        this.displayName = ko.observable();
        this.iterationCount = ko.observable();
        this.duration = ko.observable();
        this.startWhenVisible = ko.observable(false);
        this.animation = ko.observable();
    }

    @OnMounted()
    public async loadAnimations(): Promise<void> {
        const animation = this.animation();

        if (animation) {
            const styles = await this.styleService.getStyles();

            const amimationContract = Objects.getObjectAt<AnimationContract>(animation.animationKey, styles);
            this.displayName(amimationContract.displayName);

            this.animationKey(animation.animationKey);
            this.duration(animation.duration);
            this.iterationCount(animation.iterationCount);
            this.startWhenVisible(animation.startWhenVisible);
        }
        else {
            this.duration(1);
            this.iterationCount(undefined);
            this.displayName(inheritLabel);
        }

        this.duration.subscribe(this.applyChanges);
        this.iterationCount.subscribe(this.applyChanges);
        this.startWhenVisible.subscribe(this.applyChanges);
    }

    public onAnimationSelected(animation: AnimationContract): void {
        this.displayName(animation ? animation.displayName : inheritLabel);
        this.animationKey(animation ? animation.key : undefined);
        this.applyChanges();
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            if (this.animationKey()) {
                this.onUpdate({
                    iterationCount: this.iterationCount(),
                    duration: this.duration(),
                    timingFunction: "linear",
                    animationKey: this.animationKey(),
                    startWhenVisible: this.startWhenVisible()
                });
            }
            else {
                this.onUpdate(undefined);
            }
        }
    }
}