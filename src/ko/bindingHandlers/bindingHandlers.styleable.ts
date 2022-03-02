import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import { PrimitiveContract, Styleable, StyleDefinition } from "@paperbits/common/styles";
import { StyleService } from "../../styleService";
import { WidgetService } from "@paperbits/common/widgets";
import { IWidgetBinding } from "@paperbits/common/editing";


export class StylableBindingHandler {
    constructor(
        private readonly styleService: StyleService,
        private readonly widgetService: WidgetService
    ) {
        ko.bindingHandlers["styleable"] = {
            update: async (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
                const config = ko.unwrap(valueAccessor());

                const styleKey: string = typeof config === "string"
                    ? config
                    : config.key;

                let styleable: Styleable;

                if (styleKey.includes("/instance/")) {
                    // Temporary hack:
                    const styleKeyParts = styleKey.split("/");
                    const keyWithoutVariations = styleKeyParts.filter(x => x !== "default" && x !== "instance").slice(1).join("/");

                    const binding: IWidgetBinding<any, any> = viewModel["widgetBinding"];
                    const localStyles = binding.model?.styles;
                    const handler = this.widgetService.getWidgetHandler(binding.handler);

                    const styleDefinitions = handler.getStyleDefinitions();
                    const styleDefinition = Objects.getObjectAt<StyleDefinition>(keyWithoutVariations, styleDefinitions);

                    let primitive: PrimitiveContract;
                    primitive = Objects.getObjectAt(styleKey, localStyles);

                    if (!primitive) {
                        primitive = {
                            key: styleKeyParts.slice(2).join("/"),
                            displayName: styleDefinition.displayName
                        };

                        Objects.mergeDeep(primitive, styleDefinition.defaults);
                        Objects.setValue(primitive.key, localStyles, primitive);
                    }

                    styleable = {
                        style: primitive,
                        applyChanges: () => {
                            viewModel["widgetBinding"].applyChanges();
                        }
                    };
                }
                else {
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
                }

                element["styleable"] = styleable;
            }
        };
    }
}
