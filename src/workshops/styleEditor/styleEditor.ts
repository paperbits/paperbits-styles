import * as ko from "knockout";
import template from "./styleEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BoxContract, ColorContract, AnimationContract, ShadowContract, TypographyContract } from "../../contracts";


@Component({
    selector: "style-editor",
    template: template,
    injectable: "styleEditor"
})
export class StyleEditor {
    @Param()
    public elementStyle: any; // KnockoutObservable<any>;

    @Param()
    public styleKey: KnockoutObservable<string>;

    @Event()
    public onUpdate: (contract: any) => void;

    public styleName: KnockoutObservable<string>;

    constructor() {
        this.init = this.init.bind(this);
        this.onStyleNameUpdate = this.onStyleNameUpdate.bind(this);
        this.onTypographyUpdate = this.onTypographyUpdate.bind(this);
        this.onBoxModelUpdate = this.onBoxModelUpdate.bind(this);
        this.onBackgorundColorSelected = this.onBackgorundColorSelected.bind(this);
        this.onShadowSelected = this.onShadowSelected.bind(this);
        this.onAnimationSelected = this.onAnimationSelected.bind(this);
        this.styleName = ko.observable("New style");
        this.styleName.subscribe(this.onStyleNameUpdate);
    }

    @OnMounted()
    public init(): void {
        this.styleName(this.elementStyle["displayName"]);
    }

    public onStyleNameUpdate(name: string): void {
        this.elementStyle["displayName"] = name;
        this.onUpdate(this.elementStyle);
    }

    public onBackgorundColorSelected(color: ColorContract): void {
        if (color) {
            Object.assign(this.elementStyle, {
                background: {
                    colorKey: color.key
                }
            });
        }
        else if (this.elementStyle["background"]) {
            this.elementStyle["background"]["colorKey"] = undefined;
        }

        this.onUpdate(this.elementStyle);
    }

    public onShadowSelected(shadow: ShadowContract): void {
        if (shadow) {
            this.elementStyle["shadow"] = { shadowKey: shadow.key };
        }
        else {
            delete this.elementStyle["shadow"];
        }

        this.onUpdate(this.elementStyle);
    }

    public onAnimationSelected(animation: AnimationContract): void {
        if (animation) {
            this.elementStyle["animation"] = animation.key;
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