
/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleService, StyleCompiler } from "./";
import { StylePublisher } from "./publishing/stylePublisher";
import { StyledBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styled";

export class StyleModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("stylePublisher", StylePublisher);
        injector.bindSingleton("styleCompiler", StyleCompiler);
        injector.bindSingleton("styledBindingHandler", StyledBindingHandler);
    }
}