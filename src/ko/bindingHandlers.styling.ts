import * as ko from "knockout";

/* The task of this handler is to assign classes, not styles */

ko.bindingHandlers["styling"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const styleKeyObservable = valueAccessor();
        const classNameObservable = ko.observable();

        styleKeyObservable.subscribe(key => {
            const className = this.styleService.getClassNameByStyleKey(styleKeyObservable());
            styleKeyObservable(className);
        });

        ko.applyBindingsToNode(element, { css: classNameObservable });
    }
};