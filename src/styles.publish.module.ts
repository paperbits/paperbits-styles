/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleService } from "./styleService";
import { DefaultStyleCompiler } from "./defaultStyleCompiler";
import { StyledBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styled";
import { FontManager } from "./openType";
import { FontPermalinkResolver } from "./fonts/fontPermalinkResolver";
import { FontPublisher } from "./fonts/fontPublisher";


export class StylePublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("styleCompiler", DefaultStyleCompiler);
        injector.bindToCollection("autostart", StyledBindingHandler);
        injector.bindSingleton("fontManager", FontManager);
        injector.bindToCollection("permalinkResolvers", FontPermalinkResolver, "fontPermalinkResolver");
        injector.bindToCollection("publishers", FontPublisher);
    }
}