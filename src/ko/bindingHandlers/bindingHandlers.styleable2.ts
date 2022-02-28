import * as ko from "knockout";
import { PrimitiveContract, Styleable } from "@paperbits/common/styles";
import { StyleHelper, StyleService } from "../..";


export class StylableLocallyBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleableLocally"] = {
            update: async (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
                const styleKey = ko.unwrap(valueAccessor());
                const localStyles  = viewModel["widgetBinding"]?.model?.styles;

                const styleable: Styleable = {
                    style: localStyles
                };

                element["styleable"] = styleable; // for style editor
            }
        };
    }
}
