import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import { IView, IViewManager } from "@paperbits/common/ui";
import { IEventManager } from "@paperbits/common/events";
import template from "./livingStyleGuide.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../styleService";
import { FontContract, ColorContract } from "../contracts";

export interface ElementStyle {
    key: string;
    style: any;
}

@Component({
    selector: "living-style-guide",
    template: template,
    injectable: "livingStyleGuide"
})
export class LivingStyleGuide {
    public styles: KnockoutObservable<any>;
    public textBlocks: KnockoutObservableArray<any>;
    public buttons: KnockoutObservableArray<any>;
    public cards: KnockoutObservableArray<any>;
    public fonts: KnockoutObservableArray<FontContract>;
    public colors: KnockoutObservableArray<ColorContract>;
    public bodyFontDisplayName: KnockoutObservable<string>;

    constructor(
        private readonly styleService: StyleService,
        private readonly viewManager: IViewManager,
        private readonly eventManager: IEventManager
    ) {
        this.loadStyles = this.loadStyles.bind(this);
        this.addButtonVariation = this.addButtonVariation.bind(this);
        this.addCardVariation = this.addCardVariation.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
        this.updateFonts = this.updateFonts.bind(this);
        this.addFonts = this.addFonts.bind(this);
        this.addColor = this.addColor.bind(this);
        this.selectColor = this.selectColor.bind(this);
        this.removeFont = this.removeFont.bind(this);
        this.removeColor = this.removeColor.bind(this);
        this.removeStyle = this.removeStyle.bind(this);

        this.styles = ko.observable();
        this.colors = ko.observableArray();
        this.fonts = ko.observableArray([]);
        this.buttons = ko.observableArray([]);
        this.cards = ko.observableArray([]);
        this.textBlocks = ko.observableArray([]);
        this.bodyFontDisplayName = ko.observable();
    }


    @OnMounted()
    public async loadStyles(): Promise<void> {
        const styles = await this.styleService.getStyles();
        this.styles(styles);

        this.updateFonts();
        this.updateColors();
        this.updateButons();
        this.updateCards();

        const bodyFont = Utils.getObjectAt<FontContract>(styles.globals.body.typography.fontKey, styles);
        this.bodyFontDisplayName(bodyFont.displayName);
    }

    public updateFonts(): void {
        const styles = this.styles();
        const fonts = Object.keys(styles.fonts).map(key => styles.fonts[key]);
        this.fonts(fonts);
    }

    private async updateColors(): Promise<void> {
        this.colors([]);
        const styles = await this.styleService.getStyles();
        this.styles(styles);
        const colors = Object.keys(styles.colors).map(key => styles.colors[key]);
        this.colors(colors);
    }

    private async updateButons(): Promise<void> {
        this.buttons([]);
        const styles = await this.styleService.getStyles();
        this.styles(styles);
        const variations = await this.styleService.getComponentVariations("button");
        this.buttons(variations);
    }

    private async updateCards(): Promise<void> {
        this.cards([]);
        const styles = await this.styleService.getStyles();
        this.styles(styles);
        const variations = await this.styleService.getComponentVariations("card");
        this.cards(variations);
    }

    public async addFonts(): Promise<void> {
        const view: IView = {
            heading: "Google fonts",
            component: {
                name: "google-fonts",
                params: {
                    onSelect: () => {
                        this.viewManager.closeWidgetEditor();
                        this.eventManager.dispatchEvent("onStyleChange");

                        this.updateFonts();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async removeFont(font: FontContract): Promise<void> {
        this.styleService.removeStyle(font.key);
        this.updateFonts();
    }

    public async removeStyle(contract): Promise<void> {
        this.styleService.removeStyle(contract.key);
        this.applyChanges();
    }

    public async addColor(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        this.styleService.addColorVariation(variationName);

        const styles = await this.styleService.getStyles();
        this.styles(styles);

        this.eventManager.dispatchEvent("onStyleChange");
        this.updateColors();
    }

    public async removeColor(color: ColorContract): Promise<void> {
        this.styleService.removeStyle(color.key);
        this.applyChanges();
    }

    public async selectColor(color: ColorContract): Promise<void> {
        const view: IView = {
            heading: "Color editor",
            component: {
                name: "color-editor",
                params: {
                    selectedColor: color,
                    onSelect: (color: ColorContract) => {
                        this.eventManager.dispatchEvent("onStyleChange");
                        this.updateColors();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async addButtonVariation(): Promise<void> {
        const componentName = "button";
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.

        await this.styleService.addComponentVariation(componentName, variationName);

        this.applyChanges();
    }

    public async addCardVariation(): Promise<void> {
        const componentName = "card";
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.

        await this.styleService.addComponentVariation(componentName, variationName);

        this.applyChanges();
    }

    public applyChanges(): void {
        this.updateButons();
        this.updateCards();
        this.updateColors();
        this.updateFonts();
        this.styles.valueHasMutated();
    }
}