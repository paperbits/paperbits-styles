import * as ko from "knockout";
import { Styleable } from "../../contracts/styleable";
import { StyleService } from "../../styleService";


export class StylableGlobalBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleableGlobal"] = {
            update: async (element: HTMLElement, valueAccessor, allBindings, bindingContext) => {
                const config = ko.unwrap(valueAccessor());

                const styleKey: string = typeof config === "string"
                    ? config
                    : config.key;

                const style = await this.styleService.getStyleByKey(styleKey);

                if (!style) {
                    throw new Error(`Unable to find style by key ${styleKey}`);
                }

                const variationCard = bindingContext;
                const toggleBackground = () => variationCard.toggleBackground();

                let currentStateClass: string;

                const stateObservable = ko.observable();

                const setState = (state: string): void => {
                    if (currentStateClass) {
                        element.classList.remove(currentStateClass);
                    }

                    if (state) {
                        element.classList.add(state);
                    }

                    currentStateClass = state;
                    stateObservable(state);
                }

                const styleable: Styleable = {
                    style: style,
                    toggleBackground: toggleBackground,
                    setState: setState,
                    state: stateObservable,
                    variationCard: variationCard
                };

                element["styleable"] = styleable;
            }
        };
    }
}
