export enum SizeUnits {
    percents = "%",
    pixels = "px",
    fractions = "fr",
    inches = "in"
}

export class StyleSizeValue {
    constructor(
        public readonly value: number,
        public readonly units: SizeUnits
    ) { }

    public static parse(value: number | string): StyleSizeValue {
        if (typeof value === "number") {
            return new StyleSizeValue(value, SizeUnits.pixels);
        }

        let num: string;
        let units: SizeUnits;

        if (/^\d*%$/.test(value)) {
            num = value.replace("%", "");
            units = SizeUnits.percents;
        }
        else if (/^\d*px$/.test(value)) {
            num = value.replace("px", "");
            units = SizeUnits.pixels;
        }
        else if (/^\d*fr$/.test(value)) {
            num = value.replace("fr", "");
            units = SizeUnits.fractions;
        }
        else if (/^\d*in$/.test(value)) {
            num = value.replace("in", "");
            units = SizeUnits.inches;
        }

        return new StyleSizeValue(parseInt(num), units);
    }

    public toString(): string {
        return `${this.value}${this.units}`;
    }
}