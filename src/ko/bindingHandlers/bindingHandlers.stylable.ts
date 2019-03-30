import * as ko from "knockout";

ko.bindingHandlers["stylable"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const style = ko.unwrap(valueAccessor());
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

        element["stylable"] = { style: style, toggleBackground: toggleBackground };

        ko.applyBindingsToNode(element, { css: backgroundObservable }, null);
    }
};