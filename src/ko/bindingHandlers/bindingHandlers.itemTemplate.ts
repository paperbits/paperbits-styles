import * as ko from "knockout";

ko.bindingHandlers["itemTemplate"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const template = valueAccessor();
        element.innerHTML = template;
    }
};