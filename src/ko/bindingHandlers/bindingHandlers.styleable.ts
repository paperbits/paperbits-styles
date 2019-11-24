import * as ko from "knockout";
import { Styleable } from "@paperbits/common/styles";
import { StyleService } from "../..";


export class StylableBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleable"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                let style;

                if (typeof config === "string") {
                    style = await this.styleService.getStyleByKey(config);
                }
                else {
                    style = config;
                }

                if (!style) {
                    return;
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
