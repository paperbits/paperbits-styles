import * as ko from "knockout";
import { PrimitiveContract, Styleable } from "@paperbits/common/styles";
import { StyleService } from "../..";


export class StylableBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleable"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                const styleKey = typeof config === "string"
                    ? config
                    : config.key;

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

                const styleable: Styleable = {
                    style: style,
                    toggleBackground: toggleBackground
                };

                element["styleable"] = styleable;

                ko.applyBindingsToNode(element, { css: backgroundObservable }, null);
            }
        };
    }
}
