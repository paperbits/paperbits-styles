import { StylePlugin } from "./stylePlugin";
import { GridCellContract } from "../contracts/gridCellContract";

export class GridCellStylePlugin extends StylePlugin {
    public displayName = "Grid area";

    constructor() {
        super();
    }

    public async contractToJss(contract: GridCellContract): Promise<Object> {
        const result = {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignContent: "center"
        };

        if (contract.position) {
            result["gridColumnStart"] = contract.position.col;
            result["gridColumnEnd"] = contract.position.col + contract.span.cols;
            result["gridRowStart"] = contract.position.row;
            result["gridRowEnd"] = contract.position.row + contract.span.rows;
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

                result.justifyContent = value;
            }

            if (contract.alignment.vertical) {
                let value = contract.alignment.vertical;

                if (contract.alignment.vertical === "start" || contract.alignment.vertical === "end") {
                    value = "flex-" + value;
                }

                if (contract.alignment.vertical === "around" || contract.alignment.vertical === "between") {
                    value = "space-" + value;
                }

                result.alignContent = value;
            }
        }

        if (contract.overflow) {
            if (contract.overflow.vertical && contract.overflow.horizontal) {
                result["overflow"] = "auto";
            }
            else if (contract.overflow.vertical) {
                result["overflowY"] = "auto";
            }
            else {
                result["overflowX"] = "auto";
            }
        }

        return result;
    }
}