import * as ko from "knockout";
import { StyleService } from "../../styleService";

/* The task of this handler is to assign classes, not styles */

export class StyledBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleConfig = ko.unwrap(valueAccessor());

                if (!styleConfig) {
                    return;
                }

                const cssObservable = ko.observable();

                if (typeof styleConfig === "string" || styleConfig instanceof String) {
                    const className = this.styleService.getClassNameByStyleKey(<string>styleConfig);
                    cssObservable(className);
                }
                else {
                    const classNames = [];

                    for (const category of Object.keys(styleConfig)) {
                        if (!styleConfig[category]) {
                            return;
                        }

                        const className = this.styleService.getClassNameByStyleKey(<string>styleConfig[category]);

                        if (className) {
                            classNames.push(className);
                        }
                    }

                    cssObservable(classNames.join(" "));
                }

                ko.applyBindingsToNode(element, { css: cssObservable });
            }
        };
    }
}