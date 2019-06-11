import { StylePlugin } from "./stylePlugin";
import { GridContract } from "../contracts/gridContract";


export class GridStylePlugin extends StylePlugin {
    public displayName: string = "Grid";

    constructor() {
        super();
    }

    public async contractToJss(contract: GridContract): Promise<Object> {
        const result = {
            display: "grid",
            gridTemplateColumns: contract.cols.join(" "),
            gridTemplateRows: contract.rows.join(" "),
            gridColumnGap: contract.colGap,
            gridRowGap: contract.rowGap,
            width: "100%",
            flex: 1
        };

        return result;
    }
}