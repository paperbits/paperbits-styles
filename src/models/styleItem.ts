import * as ko from "knockout";
import { StyleItemContract, ThemeContract } from "../contracts";

export class StyleItem implements StyleItemContract {
    public key: string;       
    public displayName: string;
    public hasFocus: ko.Observable<boolean>;
    public stylesConfig: ThemeContract;
    public itemConfig: object;
    public classNames: string; 
    public stylesContent: string; 

    constructor(contract: StyleItemContract, stylesConfig: ThemeContract) {
        this.key = contract.key;
        this.displayName = contract.displayName;
        this.hasFocus =  ko.observable();
        this.stylesConfig = stylesConfig;
    }
}