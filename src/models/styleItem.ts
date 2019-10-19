import * as ko from "knockout";
import { StyleItemContract, ThemeContract } from "../contracts";

export class StyleItem implements StyleItemContract {
    public key: string;       
    public displayName: string;
    public category: string;
    public hasFocus: ko.Observable<boolean>;
    public stylesConfig: ThemeContract;
    public itemConfig: object;
    public classNames: string; 
    public stylesContent: string; 
    public stylesType: string; 

    constructor(contract: StyleItemContract, stylesConfig: ThemeContract, stylesType: string) {
        this.key = contract.key;
        this.displayName = contract.displayName;
        this.category = contract.category;
        this.hasFocus =  ko.observable();
        this.stylesConfig = stylesConfig;
        this.stylesType = stylesType;
    }
}