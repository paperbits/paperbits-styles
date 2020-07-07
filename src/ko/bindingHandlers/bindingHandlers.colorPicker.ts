import * as ko from "knockout";
import * as Pickr from "@simonwep/pickr";

ko.bindingHandlers["colorPicker"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const config = valueAccessor();

        const pickr = (<any>Pickr).create({
            el: element,
            theme: "classic", 
            container: element.parentElement,
            default: config.selectedColor(),
            defaultRepresentation: "HEX",
            showAlways: true,
            useAsButton: false,
            inline: true,
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
            }
        });

        pickr.on("change", (color: any) => {
            if (config.selectedColor) {
                config.selectedColor(color.toRGBA().toString());
            }
        });
    }
};