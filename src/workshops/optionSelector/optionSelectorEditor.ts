import * as ko from "knockout";
import template from "./optionSelectorEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "option-selector-editor",
    template: template
})
export class OptionSelectorEditor {
    public readonly optionItems: string[] = [];
    public readonly selectedValue: ko.Observable<string>;
    public readonly enteredValue: ko.Observable<string|number>;
    public readonly selected: ko.Observable<string>;

    @Param()
    public readonly optionsItems: ko.Observable<string>;

    @Param()
    public readonly initialValue: ko.Observable<string|number>;

    @Event()
    public readonly onChange: (value: string) => void;
    

    constructor() {
        this.optionsItems = ko.observable();
        this.initialValue = ko.observable();
        this.selectedValue = ko.observable();
        this.enteredValue = ko.observable(0);
        this.selected = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        if (this.optionsItems()) {
            this.optionItems.push(...this.optionsItems().split(","));
        }
        const initValue = this.initialValue();
        if (initValue !== 0 && !initValue) {
            this.initialValue("inherit");
        }

        const optionItem = this.optionItems.find(item => item === this.initialValue());
        if (optionItem) {
            this.selected("options");
            this.selectedValue(optionItem);
        } else {
            this.enteredValue(this.initialValue());
        }

        this.selected.subscribe(this.applyChanges);
        this.selectedValue.subscribe(this.applyChanges);
        this.enteredValue.extend(ChangeRateLimit).subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        let result;
        if (this.selected() === "options") {
            result = this.selectedValue();
        } else {
            result = this.enteredValue();
        }

        this.onChange(result);
    }
    
}