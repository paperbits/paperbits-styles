import * as ko from "knockout";
import { EventManager } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly eventManager: EventManager
    ) {
        ko.bindingHandlers["styleSheet"] = {
            update: (element: HTMLStyleElement, valueAccessor) => {
                const applyStyles = async () => {
                    const newStyles = await this.styleCompiler.compileCss();
                    const styleElement = <HTMLStyleElement>element;
                    styleElement.innerHTML = newStyles;
                };

                applyStyles();

                this.eventManager.addEventListener("onStyleChange", applyStyles);
            }
        };
    }
}

