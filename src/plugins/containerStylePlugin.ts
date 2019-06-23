import { StylePlugin } from "./stylePlugin";
import { ContainerContract } from "../contracts/containerContract";
import { StyleRule } from "@paperbits/common/styles";


export class ContainerStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async contractToStyleRules(contract: ContainerContract): Promise<StyleRule[]> {
        const rules = [
            new StyleRule("display", "flex"),
            new StyleRule("flexWrap", "wrap"),
            new StyleRule("justifyContent", "center"),
            new StyleRule("alignContent", "center")
        ];

        if (contract.alignment) {
            if (contract.alignment.horizontal) {
                let value = contract.alignment.horizontal;

                if (contract.alignment.horizontal === "start" || contract.alignment.horizontal === "end") {
                    value = "flex-" + value;
                }

                if (contract.alignment.horizontal === "around" || contract.alignment.horizontal === "between") {
                    value = "space-" + value;
                }

                rules.push(new StyleRule("justifyContent", value));
            }

            if (contract.alignment.vertical) {
                let value = contract.alignment.vertical;

                if (contract.alignment.vertical === "start" || contract.alignment.vertical === "end") {
                    value = "flex-" + value;
                }

                if (contract.alignment.vertical === "around" || contract.alignment.vertical === "between") {
                    value = "space-" + value;
                }

                rules.push(new StyleRule("alignContent", value));
            }
        }

        if (contract.overflow) {
            if (contract.overflow.vertical && contract.overflow.horizontal) {
                rules.push(new StyleRule("overflow", "auto"));
            }
            else if (contract.overflow.vertical) {
                rules.push(new StyleRule("overflowY", "auto"));
            }
            else {
                rules.push(new StyleRule("overflowX", "auto"));
            }
        }

        return rules;
    }
}