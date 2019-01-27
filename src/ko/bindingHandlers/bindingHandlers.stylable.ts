import * as ko from "knockout";

ko.bindingHandlers["stylable"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const style = ko.unwrap(valueAccessor());
        element["stylable"] = { style: style };
    }
};