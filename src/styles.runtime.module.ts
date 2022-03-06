/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { registerAnimationTriggers } from "./animationTrigger";
import { StylableRuntimeBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleable.runtime";


export class StyleRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        registerAnimationTriggers();
        injector.bindToCollection("autostart", StylableRuntimeBindingHandler);
    }
}