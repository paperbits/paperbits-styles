export enum SizeUnits {
    percents = "%",
    pixels = "px",
    fractions = "fr",
    inches = "in"
}

export class Size {
    constructor(
        public value: number,
        public units: SizeUnits = SizeUnits.pixels
    ) { }

    public static isSizeExpr(expression: unknown): boolean {
        if (typeof expression === "number") {
            return true;
        }

        if (typeof expression === "string") {
            return /^-?\d*(%|px|fr|in)?$/.test(expression);
        }

        return false;
    }

    public static parse(value: number | string): Size {
        if (!this.isSizeExpr(value)) {
            return null;
        }

        if (typeof value === "number") {
            return new Size(value, SizeUnits.pixels);
        }

        let num: string;
        let units: SizeUnits;

        if (/^-?\d*%$/.test(value)) {
            num = value.replace("%", "");
            units = SizeUnits.percents;
        }
        else if (/^-?\d*px$/.test(value)) {
            num = value.replace("px", "");
            units = SizeUnits.pixels;
        }
        else if (/^-?\d*fr$/.test(value)) {
            num = value.replace("fr", "");
            units = SizeUnits.fractions;
        }
        else if (/^-?\d*in$/.test(value)) {
            num = value.replace("in", "");
            units = SizeUnits.inches;
        }
        else if (/^-?\d*$/.test(value)) {
            num = value;
            units = SizeUnits.pixels; // assigning "px" as default units
        }

        const val = parseInt(num);

        return new Size(val, units);
    }

    public toString(): string {
        return `${this.value}${this.units}`;
    }
}

export class CalcExpression {
    public members: Size[];

    public static isExpr(expression: unknown): boolean {
        if (typeof expression !== "string") {
            return false;
        }

        if (!expression.startsWith("calc(")) {
            return false;
        }

        return true;
    }

    public static parse(expression: unknown): CalcExpression {
        if (!this.isExpr(expression)) {
            return null;
        }

        const regex = /^calc\((.*)\)$/gm;
        const result = regex.exec(<string>expression);
        const innerExpression = result[1];

        const members = innerExpression
            .replaceAll("+", ",")
            .replaceAll("-", ",-")
            .replaceAll("- ", "-")
            .replaceAll("+ ", "+")
            .split(",")
            .map(x => x.trim())
            .filter(x => !!x)
            .map(x => Size.parse(x));

        const expr = new CalcExpression();
        expr.members = members;

        return expr;
    }

    public toString(): string {
        let result = this.members[0].toString();

        if (this.members.length === 1) {
            return result;
        }

        for (let i = 1; i < this.members.length; i++) {
            const value = this.members[i].value;

            if (value === 0) {
                continue;
            }

            const absValue = Math.abs(value);
            const units = this.members[i].units;
            const sign = value > 0 ? "+" : "-";

            result += ` ${sign} ${absValue}${units}`;
        }

        return `calc(${result})`;
    }
}