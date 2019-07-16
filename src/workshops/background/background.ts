import { BackgroundStylePlugin } from "../../plugins/background/backgroundStylePlugin";
import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./background.html";
import { StyleService } from "../..";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BackgroundStylePluginConfig, ColorContract, LinearGradientContract } from "../../contracts";
import { Style, StyleSheet } from "@paperbits/common/styles";


@Component({
    selector: "background",
    template: template,
    injectable: "background"
})
export class Background {
    public readonly color: ko.Observable<any>;
    public readonly colorKey: ko.Observable<string>;
    public readonly gradientKey: ko.Observable<string>;
    public readonly source: ko.Observable<string>;
    public readonly sourceKey: ko.Observable<string>;
    public readonly repeat: ko.Observable<string>;
    public readonly size: ko.Observable<string>;
    public readonly position: ko.Observable<string>;
    public readonly backgroundPreview: ko.Observable<Object>;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaService: IMediaService,
        private readonly backgroundStylePlugin: BackgroundStylePlugin
    ) {
        this.size = ko.observable<string>();
        this.position = ko.observable<string>();
        this.color = ko.observable<any>();
        this.colorKey = ko.observable<string>();
        this.gradientKey = ko.observable<string>();
        this.repeat = ko.observable<string>();
        this.background = ko.observable<BackgroundStylePluginConfig>();
        this.source = ko.observable<string>();
        this.sourceKey = ko.observable<string>();
        this.backgroundPreview = ko.observable<string>();
    }

    @Param()
    public background: ko.Observable<BackgroundStylePluginConfig>;

    @Event()
    public onUpdate: (contract: BackgroundStylePluginConfig) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const background = this.background();

        await this.fillout(background);

        this.position.subscribe(this.applyChanges);
        this.size.subscribe(this.applyChanges);
    }

    private async fillout(backgroundPluginConfig: any): Promise<void> {
        if (!backgroundPluginConfig) {
            return;
        }

        const styleRules = await this.backgroundStylePlugin.configToStyleRules(backgroundPluginConfig);
        const style = new Style("background-preview");
        style.rules.push(...styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

        const styles = await this.styleService.getStyles();

        if (backgroundPluginConfig.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(backgroundPluginConfig.colorKey, styles);

            if (colorContract) {
                this.color(colorContract);
                this.colorKey(backgroundPluginConfig.colorKey);
            }
            else {
                console.warn(`Color with key "${backgroundPluginConfig.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (backgroundPluginConfig.images && backgroundPluginConfig.images.length > 0) {
            const image = backgroundPluginConfig.images[0];

            this.sourceKey(image.sourceKey);
            this.repeat(image.repeat || "no-repeat");
            this.size(image.size || "contain");
            this.position(image.position || "center");

            const media = await this.mediaService.getMediaByKey(image.sourceKey);
            this.source(`url("${media.downloadUrl}")`);
        }

        if (backgroundPluginConfig.gradientKey) {
            this.gradientKey(backgroundPluginConfig.gradientKey);
        }
    }

    public onMediaSelected(media: MediaContract): void {
        this.source(media ? `url("${media.downloadUrl}")` : "none");
        this.sourceKey(media ? media.key : undefined);
        this.repeat(this.repeat() || "no-repeat");
        this.size(this.size() || "contain");
        this.position(this.position() || "center center");
        this.applyChanges();
    }

    public onColorSelected(color: ColorContract): void {
        this.color(color);
        this.colorKey(color ? color.key : undefined);
        this.applyChanges();
    }

    public onGradientSelected(gradient: LinearGradientContract): void {
        this.gradientKey(gradient ? gradient.key : undefined);
        this.applyChanges();
    }

    public clearBackground(): void {
        this.color(undefined);
        this.colorKey(undefined);
        this.source("none");
        this.sourceKey(undefined);
        this.size(undefined);
        this.position(undefined);
        this.gradientKey(undefined);
        this.applyChanges();
    }

    private async applyChanges(): Promise<void> {
        let images;

        if (this.sourceKey()) {
            images = [];

            images.push({
                sourceKey: this.sourceKey(),
                position: this.position(),
                size: this.size(),
                repeat: this.repeat()
            });
        }

        const updatedPluginConfig = {
            colorKey: this.colorKey(),
            gradientKey: this.gradientKey(),
            images: images
        };

        const styleRules = await this.backgroundStylePlugin.configToStyleRules(updatedPluginConfig);
        const style = new Style("background-preview");
        style.rules.push(...styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

        if (this.onUpdate) {
            this.onUpdate(updatedPluginConfig);
        }
    }
}