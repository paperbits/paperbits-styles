import * as ko from "knockout";
import { IStyleCompiler } from "@paperbits/common/styles";

/* The task of this handler is to assign classes, not styles */

export class StyledBindingHandler {
    constructor(private readonly styleCompiler: IStyleCompiler) {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleConfig = ko.unwrap(valueAccessor());

                if (!styleConfig) {
                    return;
                }

                const cssObservable = ko.observable();

                if (typeof styleConfig === "string" || styleConfig instanceof String) {
                    const className = await this.styleCompiler.getClassNameByStyleKeyAsync(<string>styleConfig);
                    cssObservable(className);
                }
                else {
                    const classNames = await this.styleCompiler.getClassNamesByStyleConfigAsync(styleConfig);
                    cssObservable(classNames);
                }

                ko.applyBindingsToNode(element, { css: cssObservable });
            }
        };
    }
}