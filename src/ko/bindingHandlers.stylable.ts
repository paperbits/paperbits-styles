import * as ko from "knockout";

ko.bindingHandlers["stylable"] = {
    init: (element: HTMLElement, valueAccessor) => {

        ko.applyBindingsToNode(element, {
            balloon: {
                component: {
                    name: "box-editor",
                    // params: { onSelect: $component.onMediaSelected }
                }
            }
        });
    }
};