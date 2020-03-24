import * as ko from "knockout";
import template from "./gradientEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { LinearGradientContract, LinearGradientColorStopContract, getLinearGradientString, ColorContract, ThemeContract } from "../../contracts";
import { View, ViewManagerMode, ViewManager } from "@paperbits/common/ui";
import { LinearGradientViewModel, colorStopViewModel } from "./linearGradientViewModel";
import { StyleService } from "../../styleService";
import { Style, StyleSheet } from "@paperbits/common/styles";
import { BackgroundStylePlugin } from "../../plugins";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


@Component({
    selector: "gradient-editor",
    template: template
})
export class GradientEditor {
    public readonly direction: ko.Observable<number>;
    public readonly colorStops: ko.ObservableArray<LinearGradientColorStopContract>;
    public readonly gradientPreview: ko.Observable<Object>;

    public gradientViewModel: ko.Observable<LinearGradientViewModel>;

    @Param()
    public readonly selectedGradient: ko.Observable<LinearGradientContract>;

    @Event()
    public readonly onSelect: (gradient: LinearGradientContract) => void;

    constructor(
        private readonly mediaPermalinkResolver: IPermalinkResolver,
        private readonly styleService: StyleService,
        private readonly viewManager: ViewManager
    ) {
        this.initialize = this.initialize.bind(this);

        this.gradientPreview = ko.observable<string>();
        this.gradientViewModel = ko.observable();
        this.selectedGradient = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.gradientPreview(null);

        this.gradientViewModel(this.selectedGradient ? 
            new LinearGradientViewModel(this.selectedGradient()) 
            : new LinearGradientViewModel(null))

        this.attachFunction();
        this.updateBackground();
        // this.applyChanges();
    }

    public async attachFunction(): Promise<void> {
        const gradient = this.gradientViewModel();

        gradient.displayName.subscribe(this.applyChanges);
        gradient.colorStops().forEach((colorStop) => {
            colorStop.color.subscribe(this.applyChanges);
            colorStop.length.subscribe(this.applyChanges);
        })
    }

    private async applyChanges(): Promise<void> {
        const gradient = this.selectedGradient();
        const colorStops: LinearGradientColorStopContract[] = [];

        gradient.displayName = this.gradientViewModel().displayName();
        this.gradientViewModel().colorStops().forEach((colorStop) => {
            colorStops.push(<LinearGradientColorStopContract>{
                color: colorStop.color(),
                length: colorStop.length()
            })
        })

        gradient.colorStops = colorStops
        if (this.onSelect) {
            this.onSelect(gradient);
        }
        this.updateBackground()
    }

    public async addColor(): Promise<void> {
        // const viewModel = this.gradientViewModel();
        const newColor = new colorStopViewModel(<LinearGradientColorStopContract> {
            color: "#000000",
            length: 0
        })
        newColor.color.subscribe(this.applyChanges);
        newColor.length.subscribe(this.applyChanges);
        this.gradientViewModel().colorStops.push(newColor);
    }

    

    // public addColorStop(a, event: MouseEvent): void {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     const colorStopLength = Math.floor(100 * event.offsetX / (<HTMLElement>event.target).clientWidth);

    //     this.colorStops.push({ color: "#AAAAAA", length: colorStopLength });
    //     // this.applyChanges();
    // }

    // private async applyChanges(): Promise<void> {
    //     const abc = getLinearGradientString({ key: "", displayName: "", direction: `${this.direction()}deg`, colorStops: this.colorStops() });

    //     this.gradientPreview({
    //         gradientPreview: {
    //             background: { image: abc }
    //         }
    //     });

    //     console.log(this.gradientPreview());
    // }

    private async updateBackground(): Promise<void> {
        const updatedPluginConfig = {
            colorKey: null,
            gradientKey: this.gradientViewModel().key,
            images: []
        }
        const styles = await this.styleService.getStyles();
        const styleRules = await this.getBackgroundStylePlugin(styles).configToStyleRules(updatedPluginConfig);
        const style = new Style("gradient-preview");
        style.addRules(styleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.gradientPreview(styleSheet);
    }

    private getBackgroundStylePlugin(themeContract: ThemeContract): BackgroundStylePlugin {
        return new BackgroundStylePlugin(themeContract, this.mediaPermalinkResolver); 
    }

    public changeColor(obIndex: ko.Observable<number>, colorValue: string): void {
        const index = obIndex();
        this.gradientViewModel().colorStops()[index].color(colorValue);
    }
}