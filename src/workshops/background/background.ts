import { BackgroundStylePlugin } from "./../../plugins/backgroundStylePlugin";
import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./background.html";
import { StyleService } from "../..";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BackgroundContract, ColorContract, LinearGradientContract } from "../../contracts";
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
        this.initialize = this.initialize.bind(this);
        this.fillout = this.fillout.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
        this.onMediaSelected = this.onMediaSelected.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onGradientSelected = this.onGradientSelected.bind(this);
        this.clearBackground = this.clearBackground.bind(this);

        this.size = ko.observable<string>();
        this.position = ko.observable<string>();
        this.color = ko.observable<any>();
        this.colorKey = ko.observable<string>();
        this.gradientKey = ko.observable<string>();
        this.repeat = ko.observable<string>();
        this.background = ko.observable<BackgroundContract>();
        this.source = ko.observable<string>();
        this.sourceKey = ko.observable<string>();

        this.backgroundPreview = ko.observable<string>();
    }

    @Param()
    public background: ko.Observable<BackgroundContract>;

    @Event()
    public onUpdate: (contract: BackgroundContract) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const background = this.background();

        await this.fillout(background);

        this.background.subscribe(this.fillout);
    }

    private async fillout(backgroundContract: BackgroundContract): Promise<void> {
        if (!backgroundContract) {
            return;
        }

        const styleRules = await this.backgroundStylePlugin.configToStyleRules(backgroundContract);
        const style = new Style("background-preview");
        style.rules.push(...styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

        const styles = await this.styleService.getStyles();

        if (backgroundContract.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(backgroundContract.colorKey, styles);

            if (colorContract) {
                this.color(colorContract);
                this.colorKey(backgroundContract.colorKey);
            }
            else {
                console.warn(`Color with key "${backgroundContract.colorKey}" not found. Elements using it will fallback to parent's definition.`);
            }
        }

        if (backgroundContract.images && backgroundContract.images.length > 0) {
            const image = backgroundContract.images[0];

            this.sourceKey(image.sourceKey);
            this.repeat(image.repeat || "no-repeat");
            this.size(image.size || "contain");
            this.position(image.position || "center");

            const media = await this.mediaService.getMediaByKey(image.sourceKey);
            this.source(`url("${media.downloadUrl}")`);
        }

        if (backgroundContract.gradientKey) {
            this.gradientKey(backgroundContract.gradientKey);
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

        const updates = {
            colorKey: this.colorKey(),
            gradientKey: this.gradientKey(),
            images: images
        };

        const styleRules = await this.backgroundStylePlugin.configToStyleRules(updates);
        const style = new Style("background-preview");
        style.rules.push(...styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

        if (this.onUpdate) {
            this.onUpdate(updates);
        }
    }
}