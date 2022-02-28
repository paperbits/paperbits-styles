import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import { PrimitiveContract, Styleable } from "@paperbits/common/styles";
import { StyleHelper, StyleService } from "../..";


export class StylableLocallyBindingHandler {
    constructor(private readonly styleService: StyleService) {
        ko.bindingHandlers["styleableLocally"] = {
            update: async (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
                const styleKey = ko.unwrap(valueAccessor());
                const localStyles = viewModel["widgetBinding"]?.model?.styles;

                let primitive: PrimitiveContract;
                primitive = Objects.getObjectAt(styleKey, localStyles);

                if (!primitive) {
                    primitive = { key: styleKey, displayName: "Test" };
                    Objects.setValue(styleKey, localStyles, primitive);
                }

                const styleable: Styleable = {
                    style: primitive,
                    applyChanges: () => {
                        viewModel["widgetBinding"].applyChanges();
                    }
                };

                element["styleable"] = styleable; // for style editor
            }
        };
    }
}
