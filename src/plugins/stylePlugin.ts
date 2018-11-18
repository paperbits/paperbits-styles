export abstract class StylePlugin {
    public displayName: string;

    public abstract compile(contract): any;
}