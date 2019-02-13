import { BackgroundStylePlugin } from "./../../plugins/backgroundStylePlugin";
import * as ko from "knockout";
import * as Objects from "@paperbits/common";
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
    public readonly color: ko.Observable<string>;
    public readonly colorKey: ko.Observable<string>;
    public readonly gradientKey: ko.Observable<string>;
    public readonly source: ko.Observable<string>;
    public readonly sourceKey: ko.Observable<string>;
    public readonly repeat: ko.Observable<string>;
    public readonly size: ko.Observable<string>;
    public readonly position: ko.Observable<string>;

    public readonly backgroundPreview: ko.Observable<Object>;

    @Param()
    public background: ko.Observable<BackgroundContract>;

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

    private async fillout(backgroundContract: BackgroundContract): Promise<void> {
        if (!backgroundContract) {
            return;
        }

        const jss = await this.backgroundStylePlugin.contractToJss(backgroundContract);
        this.backgroundPreview({ backgroundPreview: jss });

        const styles = await this.styleService.getStyles();

        if (backgroundContract.colorKey) {
            const colorContract = Objects.getObjectAt<ColorContract>(backgroundContract.colorKey, styles);

            if (colorContract) {
                this.color(colorContract.value);
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