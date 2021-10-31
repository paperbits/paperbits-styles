import * as ko from "knockout";
import template from "./size-input.html";
import unitsTemplate from "./units.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { Keys } from "@paperbits/common";
import { SelectOption } from "@paperbits/common/ui/selectOption";
import { Size, SizeUnits } from "../../size";


@Component({
    selector: "size-input",
    template: template,
    childTemplates: { units: unitsTemplate }
})
export class SizeInput {
    public readonly value: ko.Observable<number>;
    public readonly displayUnits: ko.Observable<string>;
    public readonly units: ko.Observable<SelectOption>;
    public readonly unitSelectionAllowed: ko.Observable<boolean>;

    private pauseUpdates: boolean = false;

    public unitsOptions: SelectOption[] = [];

    public onDismiss: ko.Subscribable;

    constructor() {
        // Don't forget Inherit (and Auto?) option!
        this.size = ko.observable();
        this.displayUnits = ko.observable();
        this.value = ko.observable();
        this.units = ko.observable(this.unitsOptions[0]);
        this.onDismiss = new ko.subscribable<SelectOption[]>();
        this.applyChanges = this.applyChanges.bind(this);
        this.unitSelectionAllowed = ko.observable(false);
    }

    @Param()
    public size: ko.Observable<string>;

    @Param()
    public allowUnits: string;

    // @Event()
    // public readonly onChange: (size: string) => void;

    @OnMounted()
    public initialize(): void {
        const allowedUnits = this.allowUnits ? this.allowUnits.split(",") : ["px"];
        allowedUnits.forEach(x => this.unitsOptions.push({ value: x, text: x }));

        if (allowedUnits.length > 1) {
            this.unitSelectionAllowed(true);
        }

        this.displayUnits(this.unitsOptions[0].value);

        this.updateObservables();
        this.size.subscribe(this.updateObservables);
        this.value.subscribe(this.applyChanges);
    }

    private updateObservables(): void {
        if (this.pauseUpdates) {
            return;
        }

        const size = this.size();

        if (!size) {
            this.value(null);
            return;
        }

        const parsedSize = Size.parse(size);

        this.units(this.unitsOptions.find(x => x.value === parsedSize.units));
        this.value(parsedSize.value);
        this.displayUnits(parsedSize.units);
    }

    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case Keys.ArrowUp:
                break;

            case Keys.ArrowDown:
                break;
        }
    }

    public onUnitsChange(units: SelectOption): void {
        this.units(units);
        this.displayUnits(units.value);
        this.applyChanges();
        this.onDismiss.notifySubscribers();
    }

    private applyChanges(): void {
        this.pauseUpdates = true;

        const value = this.value();
        const units = this.units();
        const newSize = value ? new Size(this.value(), units?.value).toString() : null;

        this.size(newSize);

        // if (this.onChange) {
        //     this.onChange(newSize);
        // }

        this.pauseUpdates = false;
    }
}