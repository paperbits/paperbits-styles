/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import "./ko/bindingHandlers/bindingHandlers.colorPicker";
import "./ko/bindingHandlers/bindingHandlers.jss";
import "./ko/bindingHandlers/bindingHandlers.gradientPreview";
import "./ko/bindingHandlers/bindingHandlers.itemTemplate";
import "./ko/bindingHandlers/bindingHandlers.fontGlyph";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleEditor } from "./workshops/styleEditor";
import { StyleGuide } from "./styleGuide/styleGuide";
import { BoxEditor } from "./workshops/boxes/boxEditor";
import { BorderEditor } from "./workshops/border";
import { ColorSelector, ColorEditor } from "./workshops/colors";
import { GradientSelector, GradientEditor, ColorStopEditor } from "./workshops/gradients";
import { FontSelector } from "./workshops/fonts";
import { GoogleFonts } from "./workshops/googleFonts";
import { AnimationSelector } from "./workshops/animations";
import { AnimationEditor } from "./workshops/animations/animationEditor";
import { ShadowSelector, ShadowEditorGroup, ShadowEditor } from "./workshops/shadows";
import { Typography } from "./workshops/typography";
import { Background } from "./workshops/background";
import { StylesheetBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleSheet";
import { StylePlugin } from "./plugins";
import { StylesToolButton } from "./workshops/stylesToolButton";
import { StylePreviewBindingHandler } from "./ko/bindingHandlers/bindingHandlers.stylePreview";
import { StylableBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleable";
import { ShadowPreviewBindingHandler } from "./ko/bindingHandlers/bindingHandlers.shadowPreview";
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
import { GlyphSelector } from "./workshops/icons/glyph-selector/glyph-selector";
import { GlyphImport } from "./workshops/icons/glyph-import/glyph-import";
import { GlyphInput } from "./workshops/icons/glyph-input/glyph-input";
import { FontPermalinkResolver } from "./fonts/fontPermalinkResolver.design";
import { StyleService } from "./styleService";
import { DefaultStyleCompiler } from "./defaultStyleCompiler";
import { FontManager } from "./openType";
import { FontEditor } from "./workshops/fonts/fontEditor";
import { SizeInput } from "./workshops/size/size-input";
import { StylableLocallyBindingHandler } from "./ko/bindingHandlers/bindingHandlers.styleable2";

export class StylesDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("fontSelector", FontSelector);
        injector.bind("glyphSelector", GlyphSelector);
        injector.bind("glyphImport", GlyphImport);
        injector.bind("glyphInput", GlyphInput);
        injector.bind("sizeInput", SizeInput);
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
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("styleCompiler", DefaultStyleCompiler);
        injector.bindToCollection("autostart", StyledBindingHandler);
        injector.bind("fontEditor", FontEditor);
        injector.bindSingleton("fontManager", FontManager);
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
        injector.bindToCollection("autostart", StylableLocallyBindingHandler);
        injector.bindToCollection("autostart", ShadowPreviewBindingHandler);
        injector.bindToCollection("workshopSections", StylesToolButton);
        injector.bindToCollection("autostart", StyledBindingHandler);
        injector.bindToCollection("permalinkResolvers", FontPermalinkResolver, "fontPermalinkResolver");
    }
}