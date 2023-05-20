import * as ko from "knockout";
import { Styleable } from "@paperbits/common/styles";
import { StyleService } from "../../styleService";


export class StylableGlobalBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleableGlobal"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                const styleKey: string = typeof config === "string"
                    ? config
                    : config.key;

                let styleable: Styleable;

                const style = await this.styleService.getStyleByKey(styleKey);

                if (!style) {
                    throw new Error(`Unable to find style by key ${styleKey}`);
                }

                const backgroundObservable = ko.observable();

                let mode = 1;

                const toggleBackground = () => {
                    switch (mode) {
                        case 0:
                            backgroundObservable(null);
                            mode = 1;
                            break;
                            
                        case 1:
                            backgroundObservable("transparent");
                            mode = 2;
                            break;

                        case 2:
                            backgroundObservable("dark");
                            mode = 0;
                            break;
                    }
                };

                ko.applyBindingsToNode(element, { css: backgroundObservable }, null);

                styleable = {
                    style: style,
                    toggleBackground: toggleBackground
                };

                element["styleable"] = styleable;
            }
        };
    }
}
