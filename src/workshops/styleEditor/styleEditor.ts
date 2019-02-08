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
    @Param()
    public elementStyle: any; // ko.Observable<any>;

    @Param()
    public styleKey: ko.Observable<string>;

    @Event()
    public onUpdate: (contract: any) => void;

    public styleName: ko.Observable<string>;

    public readonly backgroundHasPicture: ko.Computed<boolean>;

    constructor() {
        this.initialize = this.initialize.bind(this);
        this.onStyleNameUpdate = this.onStyleNameUpdate.bind(this);
        this.onTypographyUpdate = this.onTypographyUpdate.bind(this);
        this.onBoxModelUpdate = this.onBoxModelUpdate.bind(this);
        this.onBackgroundUpdate = this.onBackgroundUpdate.bind(this);
        this.onShadowUpdate = this.onShadowUpdate.bind(this);
        this.onAnimationUpdate = this.onAnimationUpdate.bind(this);
        this.styleName = ko.observable("New style");
        this.styleName.subscribe(this.onStyleNameUpdate);
    }

    @OnMounted()
    public initialize(): void {
        this.styleName(this.elementStyle["displayName"]);
    }

    public onStyleNameUpdate(name: string): void {
        this.elementStyle["displayName"] = name;
        this.onUpdate(this.elementStyle);
    }

    public onBackgroundUpdate(background: BackgroundContract): void {
        this.elementStyle["background"] = background;
        this.onUpdate(this.elementStyle);
    }

    public onShadowUpdate(shadow): void {
        if (shadow) {
            this.elementStyle["shadow"] = { shadowKey: shadow.shadowKey };
        }
        else {
            delete this.elementStyle["shadow"];
        }

        this.onUpdate(this.elementStyle);
    }

    public onAnimationUpdate(animation): void {
        if (animation) {
            this.elementStyle["animation"] = {
                animationKey: animation.animationKey,
                duration: animation.duration,
                iterationCount: animation.iterationCount
            };
        }
        else {
            delete this.elementStyle["animation"];
        }

        this.onUpdate(this.elementStyle);
    }

    public onBoxModelUpdate(boxContract: BoxContract): void {
        Object.assign(this.elementStyle, boxContract);
        this.onUpdate(this.elementStyle);
    }

    public onTypographyUpdate(typographyContract: TypographyContract): void {
        this.elementStyle["typography"] = typographyContract;
        this.onUpdate(this.elementStyle);
    }
}