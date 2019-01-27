/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleModule } from "./styles.module";
import { StyleEditor } from "./workshops/styleEditor";
import { StyleGuide } from "./styleGuide/styleGuide";
import { BoxEditor } from "./workshops/boxes/boxEditor";
import { ColorSelector, ColorEditor } from "./workshops/colors";
import { GradientSelector,  GradientEditor } from "./workshops/gradients";
import { FontSelector } from "./workshops/fonts";
import { GoogleFonts } from "./workshops/googleFonts";
import { AnimationSelector } from "./workshops/animations";
import { AnimationEditor } from "./workshops/animations/animationEditor";
import { ShadowSelector } from "./workshops/shadows";
import { ShadowEditor } from "./workshops/shadows/shadowEditor";
import { Typography } from "./workshops/typography";
import { Background } from "./workshops/background";
import { StylesheetBindingHandler } from "./ko/bindingHandlers/bindingHandlers.stylesheet";
import { BackgroundStylePlugin } from "./plugins/backgroundStylePlugin";
import { StylePlugin } from "./plugins/stylePlugin";
import "./ko/bindingHandlers/bindingHandlers.stylable";
import "./ko/bindingHandlers/bindingHandlers.colorPicker";
import "./ko/bindingHandlers/bindingHandlers.jss";


export class StylingEditModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new StyleModule());
        injector.bind("fontSelector", FontSelector);
        injector.bind("googleFonts", GoogleFonts);
        injector.bind("typography", Typography);
        injector.bind("background", Background);
        injector.bind("boxEditor", BoxEditor);
        injector.bind("colorSelector", ColorSelector);
        injector.bind("colorEditor", ColorEditor);
        injector.bind("gradientSelector", GradientSelector);
        injector.bind("gradientEditor", GradientEditor);
        injector.bind("shadowSelector", ShadowSelector);
        injector.bind("shadowEditor", ShadowEditor);
        injector.bind("animationSelector", AnimationSelector);
        injector.bind("animationEditor", AnimationEditor);
        injector.bind("styleEditor", StyleEditor);
        injector.bind("styleGuide", StyleGuide);
        injector.bind("stylePlugin", StylePlugin);
        injector.bind("backgroundStylePlugin", BackgroundStylePlugin);
        injector.bindToCollection("autostart", StylesheetBindingHandler);
    }
}