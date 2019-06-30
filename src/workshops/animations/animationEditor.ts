import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./animationEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { AnimationContract } from "../../plugins/animation/animationContract";

const inheritLabel = "(Inherit)";

@Component({
    selector: "animation",
    template: template,
    injectable: "animationEditor"
})
export class AnimationEditor {
    public animationKey: ko.Observable<string>;
    public displayName: ko.Observable<string>;
    public iterationCount: ko.Observable<string | number>;
    public duration: ko.Observable<string | number>;

    @Param()
    public readonly animation: ko.Observable<any>;

    @Event()
    public readonly onUpdate: (animation) => void;

    constructor(private readonly styleService: StyleService) {
        this.applyChanges = this.applyChanges.bind(this);
        this.loadAnimations = this.loadAnimations.bind(this);
        this.onAnimationSelected = this.onAnimationSelected.bind(this);

        this.animationKey = ko.observable();
        this.displayName = ko.observable();
        this.iterationCount = ko.observable();
        this.duration = ko.observable();

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
        }
        else {
            this.duration(1);
            this.iterationCount(undefined);
            this.displayName(inheritLabel);
        }

        this.duration.subscribe(this.applyChanges);
        this.iterationCount.subscribe(this.applyChanges);
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
                    animationKey: this.animationKey()
                });
            }
            else {
                this.onUpdate(undefined);
            }
        }
    }
}