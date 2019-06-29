import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./shadowEditorGroup.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ShadowContract } from "../../contracts/shadowContract";

const inheritLabel = "(Inherit)";

@Component({
    selector: "shadow-editor-group",
    template: template,
    injectable: "shadowEditorGroup"
})
export class ShadowEditorGroup {
    public shadowKey: ko.Observable<string>;
    public displayName: ko.Observable<string>;

    @Param()
    public readonly shadow: ko.Observable<any>;

    @Event()
    public readonly onUpdate: (shadow) => void;

    constructor(private readonly styleService: StyleService) {
        this.shadow = ko.observable();
        this.shadowKey = ko.observable();
        this.displayName = ko.observable();
    }

    @OnMounted()
    public async loadShadows(): Promise<void> {
        const shadow = this.shadow();

        if (shadow) {
            const styles = await this.styleService.getStyles();

            const shadowContract = Objects.getObjectAt<ShadowContract>(shadow.shadowKey, styles);
            this.displayName(shadowContract.displayName);

            this.shadowKey(shadow.shadowKey);
        }
        else {
            this.displayName(inheritLabel);
        }
    }

    public onShadowSelected(shadow: ShadowContract): void {
        this.displayName(shadow ? shadow.displayName : inheritLabel);
        this.shadowKey(shadow ? shadow.key : undefined);
        this.applyChanges();
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            if (this.shadowKey()) {
                this.onUpdate({
                    shadowKey: this.shadowKey()
                });
            }
            else {
                this.onUpdate(undefined);
            }
        }
    }
}