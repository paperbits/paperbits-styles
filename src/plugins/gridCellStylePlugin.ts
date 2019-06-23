import { StylePlugin } from "./stylePlugin";
import { GridCellContract } from "../contracts/gridCellContract";
import { StyleRule } from "@paperbits/common/styles";


export class GridCellStylePlugin extends StylePlugin {
    public displayName: string = "Grid area";

    constructor() {
        super();
    }

    public async contractToStyleRules(contract: GridCellContract): Promise<StyleRule[]> {
        const result = [
            new StyleRule("display", "flex"),
            new StyleRule("flexWrap", "wrap"),
            new StyleRule("justifyContent", "center"),
            new StyleRule("alignContent", "center")
        ];

        if (contract.position) {
            result.push(new StyleRule("gridColumnStart", contract.position.col));
            result.push(new StyleRule("gridColumnEnd", contract.position.col + contract.span.cols));
            result.push(new StyleRule("gridRowStart", contract.position.row));
            result.push(new StyleRule("gridRowEnd", contract.position.row + contract.span.rows));
        }

        if (contract.alignment) {
            if (contract.alignment.horizontal) {
                let value = contract.alignment.horizontal;

                if (contract.alignment.horizontal === "start" || contract.alignment.horizontal === "end") {
                    value = "flex-" + value;
                }

                if (contract.alignment.horizontal === "around" || contract.alignment.horizontal === "between") {
                    value = "space-" + value;
                }

                result.push(new StyleRule("justifyContent", value));
            }

            if (contract.alignment.vertical) {
                let value = contract.alignment.vertical;

                if (contract.alignment.vertical === "start" || contract.alignment.vertical === "end") {
                    value = "flex-" + value;
                }

                if (contract.alignment.vertical === "around" || contract.alignment.vertical === "between") {
                    value = "space-" + value;
                }

                result.push(new StyleRule("alignContent", value));
            }
        }

        if (contract.overflow) {
            if (contract.overflow.vertical && contract.overflow.horizontal) {
                result.push(new StyleRule("overflow", "auto"));
            }
            else if (contract.overflow.vertical) {
                result.push(new StyleRule("overflowY", "auto"));
            }
            else {
                result.push(new StyleRule("overflowX", "auto"));
            }
        }

        return result;
    }
}