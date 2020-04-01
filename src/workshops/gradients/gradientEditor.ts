import * as ko from "knockout";
import template from "./gradientEditor.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { LinearGradientContract, LinearGradientColorStopContract, getLinearGradientString, ColorContract, ThemeContract } from "../../contracts";
import { View, ViewManagerMode, ViewManager } from "@paperbits/common/ui";
import { LinearGradientViewModel, ColorStopViewModel } from "./linearGradientViewModel";
import { StyleService } from "../../styleService";
import { Style, StyleSheet, StyleRule } from "@paperbits/common/styles";
import { BackgroundStylePlugin } from "../../plugins";
import { IPermalinkResolver } from "@paperbits/common/permalinks";


@Component({
    selector: "gradient-editor",
    template: template
})
export class GradientEditor {
    public readonly gradientPreview: ko.Observable<Object>;
    public readonly gradientViewModel: ko.Observable<LinearGradientViewModel>;

    public direction: ko.Observable<number>;
    public dragging: boolean[];
    public initialOffset: number;

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
        this.direction = ko.observable<number>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.gradientPreview(null);

        this.gradientViewModel(this.selectedGradient ? 
            new LinearGradientViewModel(this.selectedGradient()) 
            : new LinearGradientViewModel(null))
        this.direction(parseFloat(this.gradientViewModel().direction()));
        this.direction.subscribe(deg => {
            this.gradientViewModel().direction(deg + "deg");
            this.applyChanges();
            if (this.onSelect) {
                this.onSelect(this.selectedGradient());
            }
        });

        this.configDragging();

        this.attachFunction();
        this.updateBackground();
        
        this.gradientViewModel().colorStops.subscribe(this.configDragging);
    }

    private configDragging(): void {
        this.dragging = this.gradientViewModel().colorStops().map(x => false);
    }

    public async attachFunction(): Promise<void> {
        const gradient = this.gradientViewModel();

        gradient.displayName.subscribe((change) => {
            this.applyChanges()
            if (this.onSelect) {
                this.onSelect(this.selectedGradient())
            }
        });
        gradient.direction.subscribe(this.applyChanges);
        gradient.colorStops().forEach((colorStop) => {
            colorStop.color.subscribe(this.applyChanges);
            colorStop.length.subscribe(this.applyChanges);
        })
    }

    public initializePointer(element: HTMLElement, colorStop: ColorStopViewModel): boolean {
        const parentRect = element.parentElement.getBoundingClientRect();
        const length = colorStop.length();
        const position = parentRect.width * 1.0 / 100 * length - 4;
        element.style.left= position + "px";
        element.style.backgroundColor = colorStop.color();
        return true
    } 

    public async addColor(): Promise<void> {
        const newColor = new ColorStopViewModel(<LinearGradientColorStopContract> {
            color: "#000000",
            length: 0
        })
        newColor.color.subscribe(this.applyChanges);
        newColor.length.subscribe(this.applyChanges);
        this.gradientViewModel().colorStops.push(newColor);
        if (this.onSelect) {
            this.onSelect(this.selectedGradient());
        }
    }

    private async applyChanges(): Promise<void> {
        const gradient = this.selectedGradient();
        const colorStops: LinearGradientColorStopContract[] = [];

        gradient.displayName = this.gradientViewModel().displayName();
        gradient.direction = parseFloat(this.gradientViewModel().direction()) + "deg";
        this.gradientViewModel().colorStops().forEach((colorStop) => {
            colorStops.push(<LinearGradientColorStopContract>{
                color: colorStop.color(),
                length: colorStop.length()
            })
        })

        gradient.colorStops = colorStops
        this.updateBackground()
    }

    private async updateBackground(): Promise<void> {
        const style = new Style("gradient-preview");
        style.addRules([new StyleRule("backgroundImage", getLinearGradientString(this.selectedGradient()))]);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        this.gradientPreview(styleSheet);
    }

    public changeColor(obIndex: ko.Observable<number>, colorValue: string, e:HTMLElement): void {
        const index = obIndex();
        this.gradientViewModel().colorStops()[index].color(colorValue);
        if (this.onSelect) {
            this.onSelect(this.selectedGradient());
        }
    }

    public onMouseDown(obIndex: ko.Observable<number>, element: HTMLElement, event: MouseEvent, parent: any): void {
        this.configDragging()
        this.dragging[obIndex()] = true;
        this.initialOffset = event.pageX - element.offsetLeft;
    }

    public onMouseUp(): void {
        this.configDragging();
        if (this.onSelect) {
            this.onSelect(this.selectedGradient());
        }
    }

    public onMouseMove(element: HTMLElement, event: MouseEvent): void {
        let dragIndex = -1;
        for (var i = 0; i < this.dragging.length; i++) {
            if (this.dragging[i]) {
                dragIndex = i;
                break
            }
        }
        if (dragIndex == -1) {
            return;
        }
        const parentRect = element.getBoundingClientRect();
        let x = event.pageX;
        
        if (x < parentRect.x) {
          x =  parentRect.x;
        }
        
        if (x > parentRect.x + parentRect.width) {
          x =  parentRect.x + parentRect.width;
        }
        let position =  x - this.initialOffset + "px";
        (<HTMLElement>element.children.item(dragIndex)).style.left = position;
        const length = (parseFloat(position) + 4) / parentRect.width * 100;
        this.gradientViewModel().colorStops()[dragIndex].length(length);
    }
}