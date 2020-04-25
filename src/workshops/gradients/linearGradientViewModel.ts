import * as ko from "knockout";
import { LinearGradientColorStopContract, LinearGradientContract } from "../../contracts";

export class LinearGradientViewModel {
    public key: string;
    public displayName: ko.Observable<string>;
    public direction: ko.Observable<string>;
    public colorStops: ko.ObservableArray<ColorStopViewModel>;

    constructor(gradient: LinearGradientContract) {
        this.colorStops = ko.observableArray<ColorStopViewModel>([]);
        this.direction = ko.observable<string>();

        if (gradient) {
            this.key = gradient.key;
            this.displayName = ko.observable(gradient.displayName);
            this.direction(gradient.direction || "");

            if (gradient.colorStops) {
                gradient.colorStops.forEach((colorStop) => {
                    this.colorStops.push(new ColorStopViewModel(colorStop));
                });
            }
            return;
        }
        this.key = "";
        this.displayName("");
    }

    public toContract(): LinearGradientContract {
        return {
            key: this.key,
            displayName: this.displayName(),
            direction: this.direction(),
            colorStops: this.colorStops().map(x => x.toContract())
        };
    }
}

export class ColorStopViewModel {
    public readonly color: ko.Observable<string>;
    public readonly length: ko.Observable<number>;

    constructor(color: LinearGradientColorStopContract) {
        this.color = ko.observable<string>(color.color);
        this.length = ko.observable<number>(color.length);
    }

    public toContract(): LinearGradientColorStopContract {
        return {
            color: this.color(),
            length: this.length()
        };
    }
}