/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleEditor } from "./workshops/styleEditor/styleEditor";
import { BoxEditor } from "./workshops/boxes/boxEditor";
import { ColorSelector, ColorEditor } from "./workshops/colors";
import { FontSelector } from "./workshops/fonts";
import { GoogleFonts } from "./workshops/googleFonts";
import { AnimationSelector } from "./workshops/animations";
import { ShadowSelector } from "./workshops/shadows";
import { Typography } from "./workshops/typography";
import { LivingStyleGuide } from "./livingStyleGuide/livingStyleGuide";
import { StyleService } from "./styleService";
// import { StyleCompiler } from "./styleCompiler";
import { StyleableBindingHandler } from "./ko/bindingHandlers/bindingHandlers.stylable";
import { StyledBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styled";
import { StylesheetBindingHandler } from "./ko/bindingHandlers/bindingHandlers.stylesheet";
import "./ko/bindingHandlers/bindingHandlers.colorPicker";

export class StylingEditModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("fontSelector", FontSelector);
        injector.bind("googleFonts", GoogleFonts);
        injector.bind("typography", Typography);
        injector.bind("boxEditor", BoxEditor);
        injector.bind("colorSelector", ColorSelector);
        injector.bind("colorEditor", ColorEditor);
        injector.bind("shadowSelector", ShadowSelector);
        injector.bind("animationSelector", AnimationSelector);
        injector.bind("styleEditor", StyleEditor);
        // injector.bind("styleCompiler", StyleCompiler);
        injector.bindSingleton("styleService", StyleService);
        injector.bind("livingStyleGuide", LivingStyleGuide);
        injector.bindSingleton("styleableBindingHandler", StyleableBindingHandler);
        injector.bindSingleton("styledBindingHandler", StyledBindingHandler);
        injector.bindSingleton("stylesheetBindingHandler", StylesheetBindingHandler);

        injector.resolve("styleableBindingHandler");
        injector.resolve("styledBindingHandler");
        injector.resolve("stylesheetBindingHandler");
    }
}