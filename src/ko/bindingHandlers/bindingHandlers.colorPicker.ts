import * as ko from "knockout";
import * as Pickr from "pickr-widget";

ko.bindingHandlers["colorPicker"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const config = valueAccessor();

        const pickr = new Pickr({
            el: element,
            default: config.selectedColor(),
            defaultRepresentation: "HEX",
            showAlways: true,
            position: "right",
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: false,
                    rgba: false,
                    hsva: false,
                    input: false,
                    clear: false,
                    save: false
                }
            },
            onChange(hsva) {
                if (config.selectedColor) {
                    config.selectedColor(hsva.toRGBA().toString());
                }
            }
        });
    }
};