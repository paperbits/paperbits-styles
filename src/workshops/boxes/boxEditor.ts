import * as ko from "knockout";
import template from "./boxEditor.html";
import { Component } from "@paperbits/core/ko/decorators";

@Component({
    selector: "box-editor",
    template: template,
    injectable: "boxEditor"
})
export class BoxEditor {
    constructor() {

    }
}