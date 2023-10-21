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
import { FontPermalinkResolver } from "./fonts/fontPermalinkResolver.publish";
import { FontPublisher } from "./fonts/fontPublisher";
import { LocalStyleHtmlPagePublisherPlugin } from "./publishing/localStylesHtmlPagePublisherPlugin";
import { DefaultMigrationService } from "./migrations/defaultMigrationService";


export class StylePublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("styleCompiler", DefaultStyleCompiler);
        injector.bindToCollection("autostart", StyledBindingHandler);
        injector.bindSingleton("fontManager", FontManager);
        injector.bindToCollectionAsSingletone("permalinkResolvers", FontPermalinkResolver, "fontPermalinkResolver");
        injector.bindToCollectionAsSingletone("publishers", FontPublisher);
        injector.bindToCollectionAsSingletone("htmlPagePublisherPlugins", LocalStyleHtmlPagePublisherPlugin);
        injector.bindSingleton("migrationService", DefaultMigrationService);
    }
}