
import * as ko from "knockout";
import template from "./background.html";
import { StyleService } from "../..";
import { MediaContract } from "@paperbits/common/media";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BackgroundContract, ColorContract } from "../../contracts";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


@Component({
    selector: "background",
    template: template,
    injectable: "background"
})
export class Background {
    public readonly color: KnockoutObservable<string>;
    public readonly colorKey: KnockoutObservable<string>;
    public readonly source: KnockoutObservable<string>;
    public readonly sourceKey: KnockoutObservable<string>;
    public readonly repeat: KnockoutObservable<string>;
    public readonly size: KnockoutObservable<string>;
    public readonly position: KnockoutObservable<string>;

    @Param()
    public background: KnockoutObservable<BackgroundContract>;

    @Event()
    public onUpdate: (contract: BackgroundContract) => void;

    constructor(
        private readonly styleService: StyleService,
        private readonly permalinkResolver: IPermalinkResolver
    ) {
        this.initialize = this.initialize.bind(this);
        this.onMediaSelected = this.onMediaSelected.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.clearBackground = this.clearBackground.bind(this);

        this.size = ko.observable<string>();
        this.position = ko.observable<string>();
        this.color = ko.observable<string>();
        this.colorKey = ko.observable<string>();
        this.repeat = ko.observable<string>();
        this.background = ko.observable<BackgroundContract>();
        this.source = ko.observable<string>();
        this.sourceKey = ko.observable<string>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const background = this.background();

        if (background) {
            this.colorKey(background.colorKey);
            this.sourceKey(background.sourceKey);
            this.repeat(background.repeat || "no-repeat");
            this.size(background.size || "contain");
            this.position(background.position || "center center");

            if (background.colorKey) {
                const color = await this.styleService.getColorByKey(background.colorKey);
                this.color(color.value);
                this.colorKey(background.colorKey);
            }
        }

        this.size.subscribe(this.applyChanges.bind(this));
        this.position.subscribe(this.applyChanges.bind(this));
        this.colorKey.subscribe(this.applyChanges.bind(this));
        this.repeat.subscribe(this.applyChanges.bind(this));
    }

    public onMediaSelected(media: MediaContract): void {
        this.source(media ? `url("${media.downloadUrl}")` : "none");
        this.sourceKey(media ? media.permalinkKey : undefined);
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

    public clearBackground(): void {
        this.color("transparent");
        this.colorKey(undefined);
        this.source("none");
        this.sourceKey(undefined);
        this.size(undefined);
        this.position(undefined);
        this.applyChanges();
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            this.onUpdate({
                colorKey: this.colorKey(),
                sourceKey: this.sourceKey(),
                position: this.position(),
                size: this.size(),
                repeat: this.repeat()
            });
        }
    }
}