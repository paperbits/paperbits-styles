import * as ko from "knockout";
import { Styleable } from "@paperbits/common/styles";


export class StylableRuntimeBindingHandler {
    constructor() {
        ko.bindingHandlers["styleableRuntime"] = {
            init: (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                const styleKey: string = typeof config === "string"
                    ? config
                    : config.key;

                let styleable: Styleable;

                styleable = {
                    key: styleKey
                };

                element["styleable"] = styleable;
            }
        };
    }
}
