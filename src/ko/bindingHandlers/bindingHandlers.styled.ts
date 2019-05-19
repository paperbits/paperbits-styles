import * as ko from "knockout";


export class StyledBindingHandler {
    constructor() {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleConfig = ko.unwrap(valueAccessor());

                if (!styleConfig) {
                    return;
                }
                const cssObservable = ko.observable();

                let styleElement = element.ownerDocument.getElementById(styleConfig.key);

                if (styleConfig.css) {
                    if (!styleElement) {
                        styleElement = element.ownerDocument.createElement("style");
                        styleElement.id = styleConfig.key;
                        element.parentElement.insertBefore(styleElement, element);
                    }
                    
                    styleElement.innerHTML = await styleConfig.css;
                }
                else if (styleElement) {
                    styleElement.remove();
                }

                cssObservable(styleConfig.classNames);

                ko.applyBindingsToNode(element, { css: cssObservable }, null);
            }
        };
    }
}