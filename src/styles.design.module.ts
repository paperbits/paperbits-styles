/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import "./ko/bindingHandlers/bindingHandlers.colorPicker";
import "./ko/bindingHandlers/bindingHandlers.jss";
import "./ko/bindingHandlers/bindingHandlers.shadowPreview";
import "./ko/bindingHandlers/bindingHandlers.gradientPreview";
import "./ko/bindingHandlers/bindingHandlers.itemTemplate";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleModule } from "./styles.module";
import { StyleEditor } from "./workshops/styleEditor";
import { StyleGuide } from "./styleGuide/styleGuide";
import { BoxEditor } from "./workshops/boxes/boxEditor";
import { BorderEditor } from "./workshops/border";
import { ColorSelector, ColorEditor } from "./workshops/colors";
import { GradientSelector,  GradientEditor, ColorStopEditor } from "./workshops/gradients";
import { FontSelector } from "./workshops/fonts";
import { GoogleFonts } from "./workshops/googleFonts";
import { AnimationSelector } from "./workshops/animations";
import { AnimationEditor } from "./workshops/animations/animationEditor";
import { ShadowSelector, ShadowEditorGroup, ShadowEditor } from "./workshops/shadows";
import { Typography } from "./workshops/typography";
import { Background } from "./workshops/background";
import { StylesheetBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleSheet";
import { StylePlugin } from "./plugins";
import { StylesWorkshopSection } from "./workshops/stylesSection";
import { StylePreviewBindingHandler } from "./ko/bindingHandlers/bindingHandlers.stylePreview";
import { StylableBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleable";
import { Transform } from "./workshops/transform/transform";
import { Transition } from "./workshops/transitions/transition";
import { Container } from "./workshops/container/container";

import { StyleSnippetSelector } from "./workshops/snippets/styleSnippetSelector";
import { StyleSnippetService } from "./styleSnippetService";
import { StyleSnippet } from "./workshops/snippets/styleSnippet";
import { StyleVariationSelector } from "./workshops/snippets/styleVariationSelector";
import { StyledBindingHandler } from "./ko/bindingHandlers";
import { OptionSelectorEditor } from "./workshops/optionSelector/optionSelectorEditor";
import { SizeEditor } from "./workshops/size/sizeEditor";

export class StylesDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new StyleModule());
        injector.bind("fontSelector", FontSelector);
        injector.bind("googleFonts", GoogleFonts);
        injector.bind("typography", Typography);
        injector.bind("container", Container);
        injector.bind("background", Background);
        injector.bind("transform", Transform);
        injector.bind("transition", Transition);
        injector.bind("boxEditor", BoxEditor);
        injector.bind("sizeEditor", SizeEditor);
        injector.bind("borderEditor", BorderEditor);
        injector.bind("optionSelectorEditor", OptionSelectorEditor);
        injector.bind("colorSelector", ColorSelector);
        injector.bind("colorEditor", ColorEditor);
        injector.bind("colorPickerView", ColorStopEditor);
        injector.bind("gradientSelector", GradientSelector);
        injector.bind("gradientEditor", GradientEditor);
        injector.bind("shadowSelector", ShadowSelector);
        injector.bind("shadowEditor", ShadowEditor);
        injector.bind("shadowEditorGroup", ShadowEditorGroup);
        injector.bind("animationSelector", AnimationSelector);
        injector.bind("animationEditor", AnimationEditor);
        injector.bind("styleEditor", StyleEditor);
        injector.bind("styleGuide", StyleGuide);
        injector.bind("stylePlugin", StylePlugin);
        injector.bind("styleSnippet", StyleSnippet);
        injector.bind("styleSnippetSelector", StyleSnippetSelector);
        injector.bind("styleVariationSelector", StyleVariationSelector);
        injector.bindSingleton("styleSnippetService", StyleSnippetService);
        injector.bindToCollection("autostart", StylesheetBindingHandler);
        injector.bindToCollection("autostart", StylePreviewBindingHandler);
        injector.bindToCollection("autostart", StylableBindingHandler);
        injector.bindToCollection("workshopSections", StylesWorkshopSection);

        injector.bindToCollection("autostart", StyledBindingHandler);
    }
}