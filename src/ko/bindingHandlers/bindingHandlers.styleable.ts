import * as ko from "knockout";
import { Styleable } from "@paperbits/common/styles";


ko.bindingHandlers["styleable"] = {
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

