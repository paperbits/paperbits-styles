import * as ko from "knockout";
import * as Pickr from "@simonwep/pickr";

ko.bindingHandlers["colorPicker"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const config = valueAccessor();

        const pickr = Pickr.create({
            el: element,
            theme: "classic", 
            container: element.parentElement,
            default: config.selectedColor(),
            defaultRepresentation: "HEX",
            showAlways: true,
            useAsButton: false,
            position: "right",
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: false,
                    rgba: false,
                    hsva: false,
                    input: true,
                    clear: false,
                    save: false
                }
            },
            onChange(hsva: any): void {
                if (config.selectedColor) {
                    config.selectedColor(hsva.toRGBA().toString());
                }
            }
        });
    }
};