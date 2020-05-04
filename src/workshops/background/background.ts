import * as ko from "knockout";
import * as Objects from "@paperbits/common";
import template from "./background.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { Style, StyleSheet } from "@paperbits/common/styles";
import { StyleService } from "../..";
import { BackgroundStylePluginConfig, ColorContract, LinearGradientContract, ThemeContract } from "../../contracts";
import { BackgroundStylePlugin } from "../../plugins/background/backgroundStylePlugin";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";


const defaultBackgroundSize = "original";
const defaultBackgroundAttachment = "inherit";
const defaultPositionConfig = "default";

@Component({
    selector: "background",
    template: template
})
export class Background {
    public readonly color: ko.Observable<ColorContract>;
    public readonly colorKey: ko.Observable<string>;
    public readonly gradientKey: ko.Observable<string>;
    public readonly source: ko.Observable<string>;
    public readonly sourceKey: ko.Observable<string>;
    public readonly repeat: ko.Observable<string>;
    public readonly size: ko.Observable<string>;
    public readonly posConfig: ko.Observable<string>;
    public readonly position: ko.Observable<string>;
    public readonly attachment: ko.Observable<string>;
    public readonly backgroundPreview: ko.Observable<Object>;
    public readonly direction: ko.Observable<string>;

    public readonly horizontalOffsetDirection: ko.Observable<string>;
    public readonly verticalOffsetDirection: ko.Observable<string>;
    public readonly horizontalOffset: ko.Observable<number>;
    public readonly vertialOffset: ko.Observable<number>;

    private backgroundStylePlugin: BackgroundStylePlugin;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaService: IMediaService,
        private readonly mediaPermalinkResolver: IPermalinkResolver
    ) {
        this.size = ko.observable<string>();
        this.position = ko.observable<string>();
        this.posConfig = ko.observable<string>();
        this.attachment = ko.observable<string>();
        this.color = ko.observable<ColorContract>();
        this.colorKey = ko.observable<string>();
        this.gradientKey = ko.observable<string>();
        this.repeat = ko.observable<string>();
        this.background = ko.observable<BackgroundStylePluginConfig>();
        this.source = ko.observable<string>();
        this.sourceKey = ko.observable<string>();
        this.backgroundPreview = ko.observable<string>();
        this.direction = ko.observable<string>();
        
        this.horizontalOffsetDirection = ko.observable<string>();
        this.verticalOffsetDirection = ko.observable<string>();
        this.horizontalOffset = ko.observable<number>();
        this.vertialOffset = ko.observable<number>();
    }

    @Param()
    public background: ko.Observable<BackgroundStylePluginConfig>;

    @Event()
    public onUpdate: (contract: BackgroundStylePluginConfig) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.fillout();
        this.background.subscribe(this.fillout);
        this.size.subscribe(this.applyChanges);
        this.attachment.subscribe(this.applyChanges);
        this.horizontalOffset.extend(ChangeRateLimit).subscribe(this.applyDirectionOffset);
        this.vertialOffset.extend(ChangeRateLimit).subscribe(this.applyDirectionOffset);
    }

    private getBackgroundStylePlugin(themeContract: ThemeContract): BackgroundStylePlugin {
        if (!this.backgroundStylePlugin) {
            this.backgroundStylePlugin = new BackgroundStylePlugin(themeContract, this.mediaPermalinkResolver);
        }
        return this.backgroundStylePlugin;
    }

    private async fillout(): Promise<void> {
        const backgroundPluginConfig = this.background();

        if (!backgroundPluginConfig) {
            this.size(null);
            this.posConfig(null);
            this.position(null);
            this.attachment(null);
            this.color(null);
            this.colorKey(null);
            this.gradientKey(null);
            this.repeat(null);
            this.source(null);
            this.sourceKey(null);
            this.backgroundPreview(null);
            this.clearBackgroundImageOffset();
            return;
        }

        const styles = await this.styleService.getStyles();
        const styleRules = await this.getBackgroundStylePlugin(styles).configToStyleRules(backgroundPluginConfig);
        const style = new Style("background-preview");
        style.addRules(styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

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
            this.size(image.size || defaultBackgroundSize);
            this.posConfig(defaultPositionConfig);
            this.attachment(image.attachment || defaultBackgroundAttachment);
            this.position(image.position || "center");

            const media = await this.mediaService.getMediaByKey(image.sourceKey);
            this.source(`url("${media.downloadUrl}")`);
        }

        if (backgroundPluginConfig.gradientKey) {
            this.gradientKey(backgroundPluginConfig.gradientKey);
        }
    }

    public onAlignmentChange(position: string): void {
        this.direction(position);
        this.clearBackgroundImageOffset();
        
        if (position.includes("left")) {
            this.horizontalOffsetDirection("left");
        }
        else if (position.includes("right")) {
            this.horizontalOffsetDirection("right");
        } 
        else {
            this.horizontalOffsetDirection("center");
        }

        if (position.includes("top")) {
            this.verticalOffsetDirection("top");
        } 
        else if (position.includes("bottom")) {
            this.verticalOffsetDirection("bottom");
        } 
        else {
            this.verticalOffsetDirection("center");
        }

        this.applyDirectionOffset();
    }

    public applyDirectionOffset() {
        let position = "";
        if (!this.horizontalOffsetDirection() || this.horizontalOffsetDirection() === "center") {
            position += "center ";
        } else {
            position += `${this.horizontalOffsetDirection()} ${this.horizontalOffset() || 0}px `
        }
        if (!this.verticalOffsetDirection() || this.verticalOffsetDirection() === "center") {
            position += "center";
        } else {
            position += `${this.verticalOffsetDirection()} ${this.vertialOffset() || 0}px`
        }
        
        this.position(position);
        this.applyChanges();
    }

    public onAttachmentChange(attachment: string): void {
        this.attachment(attachment);
        this.applyChanges();
    }

    public onMediaSelected(media: MediaContract): void {
        this.source(media ? `url("${media.downloadUrl}")` : "none");
        this.sourceKey(media ? media.key : undefined);
        this.repeat(this.repeat() || "no-repeat");
        this.size(this.size() || defaultBackgroundSize);
        this.posConfig(this.posConfig() || defaultPositionConfig);
        this.attachment(this.attachment() || defaultBackgroundAttachment);
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
        this.posConfig(undefined);
        this.position(undefined);
        this.attachment(undefined);
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
                size: this.size() !== defaultBackgroundSize
                    ? this.size()
                    : undefined,
                repeat: this.repeat(),
                attachment: this.attachment() !== defaultBackgroundAttachment
                    ? this.attachment()
                    : undefined, 
            });
        }

        const updatedPluginConfig = {
            colorKey: this.colorKey(),
            gradientKey: this.gradientKey(),
            images: images
        };

        const styles = await this.styleService.getStyles();
        const styleRules = await this.getBackgroundStylePlugin(styles).configToStyleRules(updatedPluginConfig);
        const style = new Style("background-preview");
        style.addRules(styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.backgroundPreview(styleSheet);

        if (this.onUpdate) {
            this.onUpdate(updatedPluginConfig);
        }
    }

    private clearBackgroundImageOffset() {
        this.horizontalOffsetDirection(null);
        this.verticalOffsetDirection(null);
        this.horizontalOffset(0);
        this.vertialOffset(0);
    }
}