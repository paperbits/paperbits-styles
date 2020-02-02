
/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleService, DefaultStyleCompiler } from "./";
import { StyledBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styled";


export class StyleModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("styleCompiler", DefaultStyleCompiler);
        injector.bindToCollection("autostart", StyledBindingHandler);
    }
}