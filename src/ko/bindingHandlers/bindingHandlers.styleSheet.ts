import * as ko from "knockout";
import { StyleService } from "../../styleService";
import { StyleCompiler } from "../../styleCompiler";
import { IEventManager } from "@paperbits/common/events";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(
        private readonly styleService: StyleService,
        private readonly eventManager: IEventManager
    ) {
        ko.bindingHandlers["styleSheet"] = {
            update: (element: HTMLStyleElement, valueAccessor) => {
                const applyStyles = async () => {
                    const currentStyles = await this.styleService.getStyles();
                    const compiler = new StyleCompiler(currentStyles);
                    const newStyles = compiler.compile();
                    const styleElement = <HTMLStyleElement>element;
                    styleElement.innerHTML = newStyles;
                };

                applyStyles();

                this.eventManager.addEventListener("onStyleChange", applyStyles);
            }
        };
    }
}

