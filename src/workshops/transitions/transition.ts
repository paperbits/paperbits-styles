import * as ko from "knockout";
import template from "./transition.html";
import { StyleService } from "../../styleService";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { TransitionStylePluginConfig } from "../../plugins/transition";


const inheritLabel = "(Inherit)";

@Component({
    selector: "transition",
    template: template
})
export class Transition {
    public readonly delay: ko.Observable<number>;
    public readonly duration: ko.Observable<number>;
    public readonly property: ko.Observable<string>;
    public readonly timingFunction: ko.Observable<string>;
    public readonly enabled: ko.Computed<boolean>;

    public timingFunctionOptions: any[] = [
        { value: null, text: "(Inherit)" },
        { value: "none", text: "None" },
        { value: "ease", text: "Ease" },
        { value: "ease-in", text: "Ease in" },
        { value: "ease-out", text: "Ease out" },
        { value: "ease-in-out", text: "Ease in and out" }
    ];

    constructor(private readonly styleService: StyleService) {
        this.transition = ko.observable();
        this.delay = ko.observable();
        this.duration = ko.observable();
        this.property = ko.observable();
        this.timingFunction = ko.observable();
        this.enabled = ko.computed(() => this.timingFunction() && this.timingFunction() !== "none");
    }

    @Param()
    public transition: ko.Observable<TransitionStylePluginConfig>;

    @Event()
    public onUpdate: (contract: TransitionStylePluginConfig) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const transitions = this.transition();

        await this.fillout(transitions);

        this.delay.subscribe(this.applyChanges);
        this.duration.subscribe(this.applyChanges);
        this.property.subscribe(this.applyChanges);
        this.timingFunction.subscribe(this.applyChanges);
    }

    private async fillout(transitionsConfig: TransitionStylePluginConfig): Promise<void> {
        if (!transitionsConfig) {
            return;
        }

        this.delay(transitionsConfig.delay || 0);
        this.duration(transitionsConfig.duration || 1);
        this.property(transitionsConfig.property || "all");
        this.timingFunction(transitionsConfig.timingFunction);
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            this.onUpdate({
                delay: this.delay(),
                duration: this.duration(),
                property: this.property(),
                timingFunction: this.timingFunction()
            });
        }
    }
}