import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./shadow.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { ShadowStylePluginConfig } from "../../plugins/shadow/shadowStylePluginConfig";
import { ShadowContract } from "../../contracts/shadowContract";

const inheritLabel = "(Inherit)";

@Component({
    selector: "shadow",
    template: template
})
export class ShadowEditorGroup {
    public shadowKey: ko.Observable<string>;
    public displayName: ko.Observable<string>;

    @Param()
    public readonly shadow: ko.Observable<any>;

    @Event()
    public readonly onUpdate: (shadow: ShadowStylePluginConfig) => void;

    constructor(private readonly styleService: StyleService) {
        this.shadow = ko.observable();
        this.shadowKey = ko.observable();
        this.displayName = ko.observable();
    }

    @OnMounted()
    public async loadShadows(): Promise<void> {
        const shadow = this.shadow();

        let displayName = inheritLabel;

        if (shadow) {
            const shadowContract = await this.styleService.getShadow(shadow.shadowKey);

            if (shadowContract) {
                displayName = shadowContract.displayName;
                this.shadowKey(shadowContract.key);
            }
        }

        this.displayName(displayName);
    }

    public onShadowSelected(shadow: ShadowContract): void {
        this.displayName(shadow ? shadow.displayName : inheritLabel);
        this.shadowKey(shadow ? shadow.key : null);
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
                this.onUpdate(null);
            }
        }
    }
}