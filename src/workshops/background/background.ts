import { BackgroundStylePlugin } from "./../../plugins/backgroundStylePlugin";
import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import template from "./background.html";
import { StyleService } from "../..";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BackgroundContract, ColorContract, LinearGradientContract } from "../../contracts";


@Component({
    selector: "background",
    template: template,
    injectable: "background"
})
export class Background {
    public readonly color: KnockoutObservable<string>;
    public readonly colorKey: KnockoutObservable<string>;
    public readonly gradientKey: KnockoutObservable<string>;
    public readonly source: KnockoutObservable<string>;
    public readonly sourceKey: KnockoutObservable<string>;
    public readonly repeat: KnockoutObservable<string>;
    public readonly size: KnockoutObservable<string>;
    public readonly position: KnockoutObservable<string>;

    public readonly backgroundPreview: KnockoutObservable<Object>;

    @Param()
    public background: KnockoutObservable<BackgroundContract>;

    @Event()
    public onUpdate: (contract: BackgroundContract) => void;

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
        this.color = ko.observable<string>();
        this.colorKey = ko.observable<string>();
        this.gradientKey = ko.observable<string>();
        this.repeat = ko.observable<string>();
        this.background = ko.observable<BackgroundContract>();
        this.source = ko.observable<string>();
        this.sourceKey = ko.observable<string>();

        this.backgroundPreview = ko.observable<string>();
    }

    private async fillout(background: BackgroundContract): Promise<void> {
        if (!background) {
            return;
        }

        const jss = await this.backgroundStylePlugin.contractToJss(background);
        this.backgroundPreview({ backgroundPreview: jss });

        const styles = await this.styleService.getStyles();

        if (background.colorKey) {
            const color = Utils.getObjectAt<ColorContract>(background.colorKey, styles);
            this.color(color.value);
            this.colorKey(background.colorKey);
        }

        if (background.images && background.images.length > 0) {
            const image = background.images[0];

            this.sourceKey(image.sourceKey);
            this.repeat(image.repeat || "no-repeat");
            this.size(image.size || "contain");
            this.position(image.position || "center");

            const media = await this.mediaService.getMediaByKey(image.sourceKey);
            this.source(`url("${media.downloadUrl}")`);
        }

        if (background.gradientKey) {
            // gradient = Utils.getObjectAt<LinearGradientContract>(background.gradientKey, styles);
            this.gradientKey(background.gradientKey);
        }
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const background = this.background();

        await this.fillout(background);

        this.size.subscribe(this.applyChanges);
        this.position.subscribe(this.applyChanges);
        this.colorKey.subscribe(this.applyChanges);
        this.repeat.subscribe(this.applyChanges);
        this.background.subscribe(this.fillout);
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
        this.color(color ? color.value : "transparent");
        this.colorKey(color ? color.key : undefined);
        this.applyChanges();
    }

    public onGradientSelected(gradient: LinearGradientContract): void {
        this.gradientKey(gradient ? gradient.key : undefined);
        this.applyChanges();
    }

    public clearBackground(): void {
        this.color("transparent");
        this.colorKey(undefined);
        this.source("none");
        this.sourceKey(undefined);
        this.size(undefined);
        this.position(undefined);
        this.gradientKey(undefined);
        this.applyChanges();
    }

    private async applyChanges(): Promise<void> {
        if (this.onUpdate) {
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

            this.onUpdate(updates);

            const jss = await this.backgroundStylePlugin.contractToJss(updates);
            this.backgroundPreview({ backgroundPreview: jss });
        }
    }
}